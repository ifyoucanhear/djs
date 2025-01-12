// módulos discord.js
var Endpoints = require("./Endpoints.js");
var User = require("./User.js");
var Server = require("./Server.js");
var Channel = require("./Channel.js");

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

    get servers() {
		return this.serverCache;
	}
	
	get channels() {
		return this.channelCache;
	}
	
	get users() {
		return this.userCache;
	}

	sendPacket(JSONObject) {
		if (this.websocket.readyState === 1) {
			this.websocket.send(JSON.stringify(JSONObject));
		}
	}

    // debug padrão
    debug(message) {
        console.log(message);
    }

    on(event, fn){
		this.events.set(event, fn);
	}
	
	off(event, fn){
		this.events.delete(event);
	}

	keepAlive(){
		this.debug("keep alive alertado");

		this.sendPacket({
			op: 1,
			d: Date.now()
		});
	}

    // trigger padrão
    trigger(event) {
        var args = [];

		for (var arg in arguments) {
			args.push(arguments[arg]);
		}

		var evt = this.events.get(event);

		if (evt) {
			evt.apply(this, args.slice(1));
		}
    }

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

                    for (var _server of data.guilds) {
						self.addServer(_server);
					}

					self.trigger("ready");
					self.debug(`foram armazenados ${self.serverCache.size} servidores, ${self.channelCache.size} canais e ${self.userCache.size} usuários.`);

					setInterval(function() {
                        self.keepAlive.apply(self);
                    }, data.heartbeat_interval);
					
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

    // addchannel padrão
    addChannel(data, serverId) {
		if (!this.channelCache.has(data.id)) {
			this.channelCache.set(data.id, new Channel(data, this.getServer("id", serverId)));
		}

		return this.channelCache.get(data.id);
	}

    // addserver padrão
    addServer(data) {
		if(!this.serverCache.has(data.id)) {
			this.serverCache.set(data.id, new Server(data, this));
		}

		return this.serverCache.get(data.id);
	}

    // getuser padrão
    getUser(key, value) {
		for (var row of this.userCache) {
			var obj = row[1];

			if (obj[key] === value) {
				return obj;
			}
		}

		return null;
	}

    // getchannel padrão
    getChannel(key, value) {
		for (var row of this.channelCache) {
			var obj = row[1];

			if (obj[key] === value) {
				return obj;
			}
		}

		return null;
	}

	// getserver padrão
	getServer(key, value) {
		for (var row of this.serverCache) {
			var obj = row[1];

			if (obj[key] === value) {
				return obj;
			}
		}
        
		return null;
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