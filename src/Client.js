// módulos discord.js
var Endpoints = require("./Endpoints.js");

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
    }

    get ready() {
        return this.state === 3;
    }

    debug(message) {}

    // login padrão
    login(email = "test@test.com", password = "password123456", callback = function() {}) {
        var self = this;

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

        this.websocket.onopen = function() {
            self.trySendConnData(); // tentantiva de conexão
        };
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