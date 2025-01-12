// módulos discord.js
var Endpoints = require("./Endpoints.js");
var User = require("./User.js");

// módulos node
var request = require("superagent");
var WebSocket = require("ws");

var defaultOptions = {
    cache_tokens: false
}

class Client {
    constructor(options = defaultOptions, token = undefined) {
        /**
         * quando criado, caso haja um token especificado, o client
         * irá tentar conectar com isso. se o token é incorreto, não
         * será realizado nenhum effort para conexão
         */
        this.options = options;
        this.token = token;
		this.state = 0;
		this.websocket = null;
		this.events = new Map();
		this.user = null;
        this.alreadySentData = false;

        /**
         * valores de estado:
         * 
         * 0 - ausente
         * 1 - iniciando sessão
         * 2 - logado
         * 3 - pronto
         * 4 - desconectado
         */
        this.userCache = new Map();
		this.channelCache = new Map();
		this.serverCache = new Map();
    }

    get ready() {
        return this.state === 3;
    }

    // debug padrão
    debug(message) {
        console.log(message);
    }

    // trigger padrão
    trigger(event) {}

    // login padrão
    login(email = "test@test.com", password = "password123456", callback = function() {}) {
        var self = this;

        this.createws();

        if (this.state === 0 || this.state === 4) {
            this.state = 1; // configura o estado para iniciar sessão

            request
                .post(Endpoints.LOGIN)
                .send({
                    email: email,
                    password: password
                }).end(function(err, res) {
                    if (err) {
                        self.state = 4; // configura o estado para desconectado
                        self.trigger("disconnected");
						self.websocket.close();

                        callback(err);
                    } else {
                        self.state = 2; // configura o estado como logado (ainda não pronto)

                        self.token = res.body.token; // token configurado
                        self.trySendConnData();

                        callback(null, self.token);
                    }
                });
        }
    }

    // createws padrão
    createws() {
        if (this.websocket)
            return false;

        var self = this;

        this.websocket = new WebSocket(Endpoints.WEBSOCKET_HUB);

        // abrir
        this.websocket.onopen = function() {
            self.trySendConnData(); // tentantiva de conexão
        };

        // fechar
		this.websocket.onclose = function() {
			self.trigger("disconnected");
		}

        // mensagem
        this.websocket.onmessage = function(e) {
			var dat = false, data = false;

			try {
				dat = JSON.parse(e.data);

				data = dat.d;
			} catch (err) {
				self.trigger("error", err, e);

				return;
			}
			
			// mensagem válida
			switch (dat.t) {
				case "READY":
					self.debug("pacote pronto recebido");
					
					self.user = self.addUser(data.user);
					
					break;

				default:
					self.debug("pacote desconhecido recebido");
					self.trigger("unknown", dat);

					break;
			}
		}
    }

    // adduser padrão
    addUser(data) {
		if (!this.userCache.has(data.id)) {
			this.userCache.set(data.id, new User(data));
		}

		return this.userCache.get(data.id);
	}

    // trysendconndata padrão
    trySendConnData() {
        if (this.token && this.websocket.readyState === WebSocket.OPEN && !this.alreadySentData) {
            this.alreadySentData = true;

            var data = {
                op: 2,

                d: {
                    token: this.token,

					v: 2,

					properties: {
						"$os": "discord.js",
						"$browser": "discord.js",
						"$device": "discord.js",
						"$referrer": "",
						"$referring_domain": ""
					}
                }
            };

            this.websocket.send(JSON.stringify(data));
        }
    }
}

module.exports = Client;