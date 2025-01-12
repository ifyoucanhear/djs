// módulos discord.js

"use strict";

var _createClass = (function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];

            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;

            if ("value" in descriptor)
                descriptor.writable = true;

            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);

        if (staticProps)
            defineProperties(Constructor, staticProps);

        return Constructor;
    }
})();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("não é possível chamar uma classe como uma função");
    }
}

var Endpoints = require("./Endpoints.js");
var User = require("./User.js");

// módulos node
var request = require("superagent");
var WebSocket = require("ws");

var defaultOptions = {
    cache_tokens: false
};

var Client = (function() {
    function Client() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? defaultOptions : arguments[0];
        var token = arguments.length <= 1 || arguments[1] === undefined ? defaultOptions : arguments[1];

        _classCallCheck(this, Client);

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

    _createClass(Client, [{
        key: "sendPacket",

        value: function sendPacket(JSONObject) {
			if (this.websocket.readyState === 1) {
				this.websocket.send(JSON.stringify(JSONObject));
			}
		}

        // debug padrão
    }, {
        key: "debug",

        value: function debug(message) {
            console.log(message);
        }
    }, {
        key: "on",

		value: function on(event, fn) {
			this.events.set(event, fn);
		}
	}, {
		key: "off",

		value: function off(event, fn) {
			this.events["delete"](event);
		}
    }, {
        key: "keepAlive",

		value: function keepAlive() {
			this.debug("keep alive alertado");

			this.sendPacket({
				op: 1,
				d: Date.now()
			});
		}

        // trigger padrão
    }, {
        key: "trigger",

        value: function trigger(event) {
            var args = [];

            for (var arg in arguments) {
                args.push(arguments[arg]);
            }
            
            var evt = this.events.get(event);

            if (evt) {
                evt.apply(this, args.slice(1));
            }
        }
    }, {
        key: "login",

        // login padrão
        value: function login() {
            var email = arguments.length <= 0 || arguments[0] === undefined ? "test@test.com" : arguments[0];
            var password = arguments.length <= 1 || arguments[1] === undefined ? "password123456" : arguments[1];
            var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

            var self = this;

            this.createws();

            if (this.state === 0 || this.state === 4) {
                this.state = 1; // configurar o estado como iniciando sessão

                request.post(Endpoints.LOGIN).send({
                    email: email,
                    password: password
                }).end(function(err, res) {
                    if (err) {
                        self.state = 4; // estado configurado como desconectado
                        self.trigger("disconnected");
                        self.websocket.close();

                        callback(err);
                    } else {
                        self.state = 2; // estado configurado como logado (ainda não pronto)
                        self.token = res.body.token; // token configurado
                        self.trySendConnData();

                        callback(null, self.token);
                    }
                });
            }
        }

        // createws padrão
    }, {
        key: "createws",

        value: function createws() {
            if (this.websocket)
                return false;

            var self = this;

            // pronto
            this.websocket = new WebSocket(Endpoints.WEBSOCKET_HUB);

            // abrir
            this.websocket.onopen = function() {
                self.trySendConnData(); // tentativa de conexão
            };

            // fechar
            this.websocket.onclose = function() {
                self.trigger("disconnected");
            };

            // mensagem
            // abrir
            this.websocket.onmessage = function(e) {
                var dat = false,
                    data = false;

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
                        self.debug("packet pronto recebido");

                        self.user = self.addUser(data.user);

                        var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;

                        try {
							for (var _iterator = data.guilds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var _server = _step.value;

								self.addServer(_server);
							}
						} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion && _iterator["return"]) {
									_iterator["return"]();
								}
							} finally {
								if (_didIteratorError) {
									throw _iteratorError;
								}
							}
						}

						self.trigger("ready");
						self.debug("foram armazenados " + self.serverCache.size + " servidores, " + self.channelCache.size + " canais e " + self.userCache.size + " usuários.");

                        setInterval(function() {
							self.keepAlive.apply(self);
						}, data.heartbeat_interval);

                        break;

                    default:
                        self.debug("packet desconhecido recebido");

                        self.trigger("unknown", dat);

                        break;
                }
            };
        }

        // adduser padrão
    }, {
        key: "addUser",

        value: function addUser(data) {
            if (!this.userCache.has(data.id)) {
                this.userCache.set(data.id, new User(data));
            }

            return this.userCache.get(data.id);
        }

        // addchannel padrão
	}, {
		key: "addChannel",

		value: function addChannel(data, serverId) {
			if (!this.channelCache.has(data.id)) {
				this.channelCache.set(data.id, new Channel(data, this.getServer("id", serverId)));
			}

			return this.channelCache.get(data.id);
		}

		// addserver padrão
	}, {
		key: "addServer",

		value: function addServer(data) {
			if (!this.serverCache.has(data.id)) {
				this.serverCache.set(data.id, new Server(data, this));
			}

			return this.serverCache.get(data.id);
		}

		// getuser padrão
	}, {
		key: "getUser",

		value: function getUser(key, value) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.userCache[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var row = _step2.value;
					var obj = row[1];
                    
					if (obj[key] === value) {
						return obj;
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
						_iterator2["return"]();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return null;
		}

		// getchannel padrão
	}, {
		key: "getChannel",

		value: function getChannel(key, value) {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.channelCache[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var row = _step3.value;
					var obj = row[1];

					if (obj[key] === value) {
						return obj;
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
						_iterator3["return"]();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			return null;
		}

		// getserver padrão
	}, {
		key: "getServer",

		value: function getServer(key, value) {
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.serverCache[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var row = _step4.value;
					var obj = row[1];

					if (obj[key] === value) {
						return obj;
					}
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
						_iterator4["return"]();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			return null;
		}

        // trysendconndata
    }, {
        key: "trySendConnData",

        value: function trySendConnData() {
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
    }, {
        key: "ready",

        get: function get() {
            return this.state === 3;
        }
    }]);

    return Client;
})();

module.exports = Client;