var request = require("superagent");
var Endpoints = require("./lib/endpoints.js");
var Server = require("./lib/server.js").Server;
var Message = require("./lib/message.js").Message;
var User = require("./lib/user.js").User;
var Channel = require("./lib/channel.js").Channel;
var List = require("./lib/list.js").List;
var Invite = require("./lib/invite.js").Invite;
var PMChannel = require("./lib/PMChannel.js").PMChannel;
var WebSocket = require("ws");
var Internal = require("./lib/internal.js").Internal;
var TokenManager = require("./lib/TokenManager.js").TokenManager;

var serverCreateRequests = [].globalLoginTime = Date.now();

function tp(time) {
	return Date.now() - time;
}

/**
 * o módulo wrapper para o discord client também fornece alguns objetos úteis
 * 
 * @module Discord
 */
exports;

exports.Endpoints = Endpoints;
exports.Server = Server;
exports.Message = Message;
exports.User = User;
exports.Channel = Channel;
exports.List = List;
exports.Invite = Invite;
exports.PMChannel = PMChannel;

/**
 * o cliente discord usado para fazer interface com a api do discord
 * 
 * @class Client
 * @constructor
 * @param {Object} [options] um objeto contendo opções configuráveis
 * @param {Number} [options.maxmessage=5000] a quantidade máxima de mensagens a ser armazenada por canal
 */

exports.Client = function(options) {
	/**
	 * contém as opções do client
	 * 
	 * @attribute options
	 * @type {Object}
	 */
	this.options = options || {};
	this.options.maxmessage = 5000;
	this.tokenManager = new TokenManager("./", "tokencache.json");

	/**
	 * contém o token utilizado para autorizar solicitações http e conexão websocket
	 * 
	 * @attribute token
	 * @readonly
	 * @type {String}
	 */
	this.token = "";

	/**
	 * indica se o cliente está logado ou não. não indica se o cliente está pronto
	 * 
	 * @attribute loggedIn
	 * @readonly
	 * @type {Boolean}
	 */
	this.loggedIn = false;

	/**
	 * o websocket utilizado ao receber uma mensagem e outras atualizações de evento
	 * 
	 * @type {WebSocket}
	 * @attribute websocket
	 * @readonly
	 */
	this.websocket = null;

	/**
	 * um objeto contendo as funções vinculadas aos eventos. devem ser configuradas em client.on();
	 * 
	 * @type {Object}
	 * @attribute events
	 */
	this.events = {};

	/**
	 * o user da classe client, configurando quando a inicialização inicial for completa
	 * 
	 * @attribute user
	 * @type {User}
	 * @readonly
	 */
	this.user = null;

	/**
	 * indica se o cliente está pronto e armazenou em cache todos os servidores que conhece
	 * 
	 * @type {Boolean}
	 * @attribute ready
	 * @readonly
	 */
	this.ready = false;

	/**
	 * uma lista contendo todos os servidores que o client tem acesso
	 * 
	 * @attribute serverList
	 * @type {List}
	 * @readonly
	 */
	this.serverList = new List("id");

	/**
	 * uma lista contendo todos os pmchannels que o client tem acesso
	 * 
	 * @attribute PMList
	 * @type {List}
	 * @readonly
	 */
	this.PMList = new List("id");
}

/**
 * retorna a lista de todos os servidores que o client do discord tem acesso
 * 
 * @method getServers
 * 
 * @returns {List} ServerList
 */
exports.Client.prototype.getServers = function() {
	return this.serverList;
}

/**
 * retorna a lista de todos os servidores que o client do discord tem acesso
 * 
 * @method getChannels
 * 
 * @returns {List} Channelist
 */
exports.Client.prototype.getChannels = function() {
	return this.serverList.concatSublists( "channels", "id" );
}

/**
 * retorna o servidor que coincide com o id fornecido, ou falso caso não seja encontrado.
 * retornará falso se o servidor não estiver armazenado ou disponível
 * 
 * @method getServer
 * 
 * @param {String/Number} id o id do servidor
 * 
 * @return {Server} o servidor que coincida com o id
 */
exports.Client.prototype.getServer = function(id) {
	return this.getServers().filter("id", id, true);
}

/**
 * retorna o canal que coincida com o id fornecido, ou falso caso não seja encontrado
 * retornará falso se o servidor não estiver armazenado ou disponível
 * 
 * @method getChannel
 * 
 * @param {String/Number} id o id do canal
 * 
 * @return {Server} o servidor que coincida com o id
 */
exports.Client.prototype.getChannel = function(id) {
	return this.getChannels().filter("id", id, true);
}

/**
 * alerta um evento .on()
 * 
 * @param {String} event o evento que será alertado
 * @param {Array} args os argumentos que serão passados pelo método
 * 
 * @return {Boolean} se o evento for alertado com sucesso
 * 
 * @method triggerEvent
 * 
 * @private
 */
exports.Client.prototype.triggerEvent = function(event, args) {
	if (!this.ready && event !== "raw" && event !== "disconnected" && event !== "debug") { //if we're not even loaded yet, don't try doing anything because it always ends badly!
		return false;
	}
	
    if (this.events[event]) {
		this.events[event].apply(this, args);

		return true;
	} else {
		return false;
	}
}

/**
 * vincula uma função a um evento
 * 
 * @param {String} name o nome do evento ao qual a função deve estar vinculada
 * @param {Function} fn a função que deve ser vinculada ao evento
 * 
 * @method on
 */
exports.Client.prototype.on = function(name, fn) {
	this.events[name] = fn;
}

/**
 * desvincula uma função de um evento
 * 
 * @param {String} name o nome do evento que deverá ser limpo
 * 
 * @method off
 */
exports.Client.prototype.off = function(name) {
	this.events[name] = function() {};
}

exports.Client.prototype.cacheServer = function(id, cb, members) {
	var self = this;
	var serverInput = {};

	if (typeof id === 'string' || id instanceof String) {
		// é um id

		if (this.serverList.filter("id", id).length > 0) {
			return;
		}

		Internal.XHR.getServer(self.token, id, function(err, data) {
			if (!err) {
				makeServer(data);
			}
		})

	} else {
		if ( this.serverList.filter("id", id.id).length > 0) {
			return;
		}

		serverInput = id;
		id = id.id;

		makeServer(serverInput);
	}

	function channelsFromHTTP() {
		Internal.XHR.getChannel(self.token, id, function(err) {
			if (!err)
				cacheChannels(res.body);
		})
	}

	var server;

	function makeServer(dat) {
		server = new Server(
            dat.region,
            dat.owner_id,
            dat.name,
            id,
            serverInput.members || dat.members,
            dat.icon,
            dat.afk_timeout,
            dat.afk_channel_id
        );
		
        if (dat.channels)
			cacheChannels(dat.channels);
		else
			channelsFromHTTP();
	}

	function cacheChannels(dat) {
		var channelList = dat;

		for (channel of channelList) {
			server.channels.add(new Channel(channel, server));
		}

		self.serverList.add(server);

		cb(server);
	}
}

/**
 * efetua o login no cliente com as credenciais especificadas e começa a inicializá-lo
 * 
 * @async
 * 
 * @method login
 * 
 * @param {String} email o email do discord
 * @param {String} password a senha do discord
 * 
 * @param {Function} [callback] chamado quando recebeu resposta do servidor de autenticação
 * @param {Object} callback.error definido como nulo se não houve erro ao fazer login, caso contrário, é um objeto que pode ser avaliado como true
 * @param {String} callback.error.reason a razão pela qual houve um erro
 * @param {Object} callback.error.error o erro xhr bruto
 * @param {String} callback.token o token recebido ao fazer login
 */
exports.Client.prototype.login = function(email, password, callback, noCache) {
	globalLoginTime = Date.now();

	this.debug("login solicitado em " + globalLoginTime);

	var self = this;
	callback = callback || function() {};

	if (noCache == undefined || noCache == null) {
		noCache = false;
	}

	self.connectWebsocket();

	if (this.tokenManager.exists(email) && !noCache) {
		var token = this.tokenManager.getToken(email, password);

		if (!token.match(/[^\w.-]+/g)) {
			done(this.tokenManager.getToken(email, password));

			self.debug("token carregado de caches em " + tp(globalLoginTime));

			return;
		} else {
			self.debug("ocorreu um erro ao obter o token das caches, utilizando a autenticação padrão...");
		}

		return;
	}

	var time = Date.now();

	Internal.XHR.login(email, password, function(err, token) {
		if (err) {
			self.triggerEvent("disconnected", [{
				reason: "ocorreu um erro ao iniciar a sessão",
				error: err
			}]);

			self.websocket.close();

			self.debug("falha ao iniciar sessão em " + tp(globalLoginTime));
		} else {
			if (!noCache) {
				self.tokenManager.addToken(email, token, password);
			}

			self.debug("token carregado de servidores de autenticação em " + tp(globalLoginTime));

			done(token);
		}
	});

	function done(token) {
		self.debug("utilizando o token " + token);
		self.token = token;
		self.websocket.sendData();
		self.loggedIn = true;

		callback(null, token);
	}
}

/**
 * responde a uma mensagem com uma determinada mensagem
 * 
 * @param {Message/User/Channel/Server/String} destination para onde a mensagem deve ser enviada. ids de canal também podem ser usados ​​aqui
 * @param {String/Message/Array} toSend se for uma mensagem, o conteúdo da mensagem será enviado. se for um array, será enviada uma mensagem do array separada por uma nova linha. se for uma String, a string será enviada
 * @param {Function} callback chamado quando uma resposta da api foi recebida, a mensagem foi enviada ou não
 * @param {Object} callback.error se houveram erros, este seria um objeto xhr error. caso contrário, será nulo
 * @param {Message} callback.message se não houve erros, esta será a mensagem enviada na forma message
 * @param {Object} options veja sendmessage(options)
 * 
 * @method reply
 */
exports.Client.prototype.reply = function(destination, toSend, callback, options) {
	if (toSend instanceof Array) {
		toSend = toSend.join("\n");
	}

	toSend = destination.author.mention() + ", " + toSend;

	this.sendMessage(destination, toSend, callback, options);
}

exports.Client.prototype.connectWebsocket = function(cb) {
	var self = this;

	var sentInitData = false;

	this.websocket = new WebSocket(Endpoints.WEBSOCKET_HUB);

	this.websocket.onclose = function(e) {
		self.triggerEvent("disconnected", [{
			reason: "websocket desconectado",
			error: e
		}]);
	};

	this.websocket.onmessage = function(e) {
		self.triggerEvent("raw", [e]);

		var dat = JSON.parse(e.data);
		var webself = this;

		switch (dat.op) {
			case 0:
				if (dat.t === "READY") {
					self.debug("pacote ready obtido");

					var data = dat.d;

					self.user = new User(data.user);

					var _servers = data.guilds,
						servers = [];

					var cached = 0,
						toCache = _servers.length;

					for (x in data.private_channels) {
						self.PMList.add(new PMChannel(data.private_channels[x].recipient, data.private_channels[x].id));
					}

					for (x in _servers) {
						_server = _servers[x];

						self.cacheServer(_server, function(server) {
							cached++;

							if (cached === toCache) {
								self.ready = true;
								self.triggerEvent("ready");
								self.debug("ready alertado");
							}
						});
					}

					setInterval(function() {
						webself.keepAlive.apply(webself)
					}, data.heartbeat_interval);
				} else if (dat.t === "MESSAGE_CREATE") {
					var data = dat.d;
					var channel = self.getChannel(data.channel_id);
					var message = new Message(data, channel);

					self.triggerEvent("message", [message]);

					if (channel.messages)
						channel.messages.add(message);
				} else if (dat.t === "MESSAGE_DELETE") {
					var data = dat.d;
					var channel = self.getChannel(data.channel_id);

					if (!channel.messages)
						return;

					var _msg = channel.messages.filter("id", data.id, true);

					if (_msg) {
						self.triggerEvent("messageDelete", [_msg]);

						channel.messages.removeElement(_msg);
					}
				} else if (dat.t === "MESSAGE_UPDATE") {
					var data = dat.d;

					if (!self.ready)
						return;

					var formerMessage = false;
					var channel = self.getChannel(data.channel_id);

					if (channel) {
						formerMessage = channel.messages.filter("id", data.id, true);

						var newMessage;

						data.author = data.author || formerMessage.author;
						data.timestamp = data.time || formerMessage.time;
						data.content = data.content || formerMessage.content;
						data.channel = data.channel || formerMessage.channel;
						data.id = data.id || formerMessage.id;
						data.mentions = data.mentions || formerMessage.mentions;
						data.mention_everyone = data.mention_everyone || formerMessage.everyoneMentioned;
						data.embeds = data.embeds || formerMessage.embeds;

						try {
							newMessage = new Message(data, channel);
						} catch (e) {
							self.debug("pacote de atualização de mensagem deixado");

							return;
						}

						self.triggerEvent("messageUpdate", [formerMessage, newMessage]);

						if (formerMessage)
							channel.messages.updateElement(formerMessage, newMessage);
						else
							channel.messages.add(newMessage);
					}
				} else if (dat.t === "PRESENCE_UPDATE") {
					var data = dat.d;

					self.triggerEvent("presence", [new User(data.user), data.status, self.serverList.filter("id", data.guild_id, true)]);
				} else if (dat.t === "GUILD_DELETE") {
					var deletedServer = self.serverList.filter("id", dat.d.id, true);

					if (deletedServer) {
						self.triggerEvent("serverDelete", [deletedServer]);
					}
				} else if (dat.t === "CHANNEL_DELETE") {
					var delServer = self.serverList.filter("id", dat.d.guild_id, true);

					if (delServer) {
						var channel = delServer.channels.filter("id", dat.d.id, true);

						if (channel) {
							self.triggerEvent("channelDelete", [channel]);
						}
					}
				} else if (dat.t === "GUILD_CREATE") {
					if (!self.serverList.filter("id", dat.d.id, true)) {
						self.cacheServer(dat.d, function(server) {
							if (serverCreateRequests[server.id]) {
								serverCreateRequests[server.id](null, server);
								serverCreateRequests[server.id] = null;
							} else {
								self.triggerEvent("serverJoin", [server]);
							}
						});
					}
				} else if (dat.t === "CHANNEL_CREATE") {
					var srv = self.serverList.filter("id", dat.d.guild_id, true);

					if (srv) {
						if (!srv.channels.filter("id", dat.d.d, true)) {

							var chann = new Channel(dat.d, srv);

							srv.channels.add(new Channel(dat.d, srv));
							self.triggerEvent("channelCreate", [chann]);
						}
					}
				}

				break;
		}
	};

	this.websocket.sendPacket = function(p) {
		this.send(JSON.stringify(p));
	}

	this.websocket.keepAlive = function() {
		if (this.readyState !== 1)
			return false;

		this.sendPacket({
			op: 1,
			d: Date.now()
		});
	}

	this.websocket.onopen = function() {
		self.debug("conexão websocket aberta");

		this.sendData("onopen");
	}

	this.websocket.sendData = function(why) {
		if (this.readyState == 1 && !sentInitData && self.token) {
			sentInitData = true;

			var connDat = {
				op: 2, d: {
					token: self.token,
					v: 2
				}
			};

			connDat.d.properties = Internal.WebSocket.properties;

			this.sendPacket(connDat);
		}
	}
}

exports.Client.prototype.debug = function(msg) {
	this.triggerEvent("debug", ["[SL " + tp(globalLoginTime) + "]    " + msg]);
}

/**
 * desconecta o cliente atual do discord e fecha todas as conexões
 * 
 * @param {Function} callback chamado após uma resposta ser obtida
 * @param {Object} callback.error nulo, a menos que tenha havido um erro; nesse caso, é um erro xhr
 * 
 * @method logout
 */
exports.Client.prototype.logout = function(callback) {
	callback = callback || function() {};
	
	var self = this;

	Internal.XHR.logout(self.token, function(err) {
		if (err) {
			callback(err);
		}
		
        self.loggedIn = false;
		self.websocket.close();
	});
}

/**
 * cria um servidor com um nome e região específico e então retorna
 * 
 * @param {String} name o nome do servidor
 * @param {String} region a região do servidor
 * @param {Function} callback chamado quando a solicitação for feita
 * @param {Object} callback.error um erro xhr ou nulo caso não haja erros
 * @param {Server} callback.server um objeto server representando o servidor criado
 * 
 * @method createServer
 * 
 * @async
 */
exports.Client.prototype.createServer = function(name, region, cb) {
	var self = this;

	Internal.XHR.createServer(self.token, name, region, function(err, data) {

		if (err) {
			cb(err);
		} else {

			self.cacheServer(data, function(server) {
				cb(null, server);
			});
		}
	});
}

/**
 * faz o cliente sair do servidor
 * 
 * @param {Server} server um objeto de servidor. o servidor que será deixado
 * @param {Function} callback chamado quando a solicitação de saída for feita
 * @param {Object} callback.error um erro xhr ou nulo caso não haja erros
 * @param {Server} callback.server um objeto de servidor representando o servidor deletado
 * 
 * @method leaveServer
 * 
 * @async
 */
exports.Client.prototype.leaveServer = function(server, callback) {
	var self = this;

	// callback não é necessário para esta função
	callback = callback || function() {};

	Internal.XHR.leaveServer( self.token, server.id, function(err) {
		if (err) {
			callback(err);
		} else {
			self.serverList.removeElement(server);
			
            callback(null, server);
		}
	});
}

/**
 * cria um convite para o canal/servidor especificado com as opções especificadas
 * 
 * @param {Channel/Server} channel o canal/servidor para o qual o convite deve ser feito
 * @param {Object} [options] as opções para o convite
 * @param {Number} [options.max_age=0] quando o convite expirar em segundos
 * @param {Number} [options.max_uses=0] quantos usos o convite ainda tem
 * @param {Boolean} [options.temporary=false] se o convite é temporário
 * @param {Boolean} [options.xkcdpass=false] se o código do convite deve ser composto por palavras
 * @param {Function} callback chamado quando a solicitação de um convite for feita
 * @param {Object} callback.error um erro xhr ou nulo caso não haja erros
 * @param {Invite} callback.invite um objeto de convite representando o convite criado
 * 
 * @method createInvite
 */
exports.Client.prototype.createInvite = function(channel, options, callback) {
	var self = this;
	var options = options || {};

	// callback não é necessário para esta função
	callback = callback || function() {};

	if (channel instanceof Server) {
		channel = channel.getDefaultChannel();
	}

	options.max_age = options.max_age || 0;
	options.max_uses = options.max_uses || 0;
	options.temporary = options.temporary || false;
	options.xkcdpass = options.xkcd || false;

	Internal.XHR.createInvite(self.token, channel.id, options, function(err, data) {
		if (err) {
			callback(err);
		} else {
			callback(null, new Invite(data));
		}
	});
}

exports.Client.prototype.startPM = function(user, callback) {
	var self = this;

	callback = callback || function() {};

	Internal.XHR.startPM(self.token, self.user.id, user.id, function(err, data) {
		if (err) {
			callback(err);
		} else {
			var channel = new PMChannel(data.recipient, data.id);

			self.PMList.add(channel);

			callback(null, channel);
		}
	});
}

/**
 * envia uma mensagem para o destino específico
 * 
 * @param {Server/Channel/PMChannel/Message/User/String} destination aonde a mensagem deverá ser enviada
 * @param {String/Array/Message} toSend a mensagem a ser enviada
 * @param {Function} callback chamado quando a mensagem for enviada
 * @param {Object} error um erro xhr ou nulo caso não haja erros
 * @param {Message} message um objeto de mensagem representando o objeto enviado
 * @param {Object} [options] um objeto contendo as opções para a mensagem
 * @param {Array/Boolean/String} [options.mentions=true] caso um array, deverá ser um array dos ids dos usuários. caso booleano, deve não notificar ninguém
 * @param {Number} [options.selfDestruct=false] caso especificado, deverá ser a quantidade de milisegundos em que a mensagem deverá ser deletada depois de enviada
 * 
 * @method sendMessage
 */
exports.Client.prototype.sendMessage = function(destination, toSend, callback, options) {
	options = options || {};
	callback = callback || function() {};

	var channel_id, message, mentions, self = this;

	channel_id = resolveChannel(destination, self);
	message = resolveMessage(toSend);
	mentions = resolveMentions(message, options.mention);

	if (channel_id) {
		send();
	} else {
		// um canal está sendo classificado
	}

	function send() {
		Internal.XHR.sendMessage(self.token, channel_id, {
			content: message,
			mentions: mentions
		}, function(err, data) {
			if (err) {
				callback(err);
			} else {
				var msg = new Message(data, self.getChannel(data.channel_id));
				
				if (options.selfDestruct) {
					setTimeout( function() {
						self.deleteMessage(msg);
					}, options.selfDestruct);
				}

				callback(null, msg);
			}
		});
	}

	function setChannId(id) {
		channel_id = id;
	}

	function resolveChannel(destination, self) {
		var channel_id = false;

		if (destination instanceof Server) {
			channel_id = destination.getDefaultChannel().id;
		} else if (destination instanceof Channel) {
			channel_id = destination.id;
		} else if (destination instanceof PMChannel) {
			channel_id = destination.id;
		} else if (destination instanceof Message) {
			channel_id = destination.channel.id;
		} else if (destination instanceof User) {
			var destId = self.PMList.deepFilter(["user", "id"], destination.id, true);

			if (destId) {
				channel_id = destId.id;
			} else {
				// inicia um pm e depois faça uso disso

				self.startPM(destination, function(err, channel) {
					if (err) {
						callback(err);
					} else {
						self.PMList.add(new PMChannel(channel.user, channel.id));

						setChannId(channel.id);
						
						send();
					}
				});

				return false;
			}
		} else {
			channel_id = destination;
		}

		return channel_id;
	}

	function resolveMessage(toSend) {
		var message;

		if (typeof toSend === "string" || toSend instanceof String)
			message = toSend;
		else if (toSend instanceof Array)
			message = toSend.join("\n");
		else if ( toSend instanceof Message )
			message = toSend.content;
		else
			message = toSend;
		return message.substring(0, 2000);
	}

	function resolveMentions(message, mentionsOpt ) {
		var mentions = [];

		if (mentionsOpt === false) {} else if (mentionsOpt || mentionsOpt === "auto" || mentionsOpt == null || mentionsOpt == undefined) {
			for (mention of(message.match(/<@[^>]*>/g) || [])) {
				mentions.push(mention.substring(2, mention.length - 1));
			}
		} else if (mentionsOpt instanceof Array) {
			for (mention of mentionsOpt) {
				if (mention instanceof User) {
					mentions.push(mention.id);
				} else {
					mentions.push(mention);
				}
			}
		}

		return mentions;
	}
}

/**
 * deleta a mensagem específica caso o bot tenha essa autoridade
 * 
 * @param {Message} message a mensagem a ser deletada
 * @param {Function} callback chamado depois que a solicitação de exclusão for feita
 * @param {Object} callback.error caso haja algum erro, será um objeto de erro xhr. caso contrário, será nulo
 * @param {Message} callback.message um objeto de mensagem representando o objeto deletado
 * 
 * @method deleteMessage
 */
exports.Client.prototype.deleteMessage = function(message, callback) {
	callback = callback || function() {};

	var self = this;

	Internal.XHR.deleteMessage(self.token, channel.id, message.id, callback);
}

exports.Client.prototype.updateMessage = function(oldMessage, newContent, callback, options) {
	var self = this;
	var channel = oldMessage.channel;

	options = options || {};

	Internal.XHR.updateMessage(self.token, channel.id, oldMessage.id, {
		content: newContent,
		mentions: []
	}, function(err, data) {
		if (err) {
			callback(err);

			return;
		}

		var msg = new Message(data, self.getChannel(data.channel_id));

		if (options.selfDestruct) {
			setTimeout(function() {
				self.deleteMessage(msg);
			}, options.selfDestruct);
		}

		callback(null, msg);
	});
}

exports.Client.prototype.getChannelLogs = function(channel, amount, callback) {
	var self = this;

	Internal.XHR.getChannelLogs(self.token, message.channel.id, (amount || 50), function( err, data ) {
		if (err) {
			callback(err);

			return;
		}
		
		var logs = new List("id");

		for (message of data) {
			logs.add(new Message(message, channel));
		}

		callback(null, logs);
	});
}

exports.Client.prototype.createChannel = function(server, name, type, callback) {
	var self = this;

	Internal.XHR.createChannel(self.token, server.id, name, type, function(err, data) {
		if (err) {
			callback(err);
		} else {
			var chann = new Channel(data, server);
			
            server.channels.add(chann);
			
            callback(null, chann);
		}
	});
}

exports.Client.prototype.deleteChannel = function(channel, callback) {
	var self = this;

	Internal.XHR.deleteChannel(self.token, channel.id, function(err) {
		channel.server.channels.removeElement(channel);

		self.triggerEvent("channelDelete", [channel]);

		callback(null);
	});
}

exports.Client.prototype.deleteServer = function(server, callback) {
	var self = this;

	Internal.XHR.deleteServer(self.token, server.id, function(err) {
		self.serverList.removeElement(server);
		self.triggerEvent("serverDelete", [server]);
		
        callback(null);
	});
}

exports.Client.prototype.joinServer = function(invite, callback) {
	var self = this;
	var code = (invite instanceof Invite ? invite.code : invite);

	Internal.XHR.acceptInvite(self.token, code, function(err, inviteData) {
		if (err) {
			callback(err);
		} else {
			serverCreateRequests[inviteData.guild.id] = callback;
		}
	});
}

exports.Client.prototype.getServers = function() {
 	return this.serverList;
}

exports.Client.prototype.getChannels = function() {
	return this.serverList.concatSublists("channels", "id");
}

exports.Client.prototype.getUsers = function() {
	return this.getServers().concatSublists("members", "id");
}

exports.Client.prototype.getServer = function(id) {
	return this.getServers().filter("id", id, true);
}

exports.Client.prototype.getChannel = function(id) {
	return this.getChannels().filter("id", id, true);
}

exports.Client.prototype.getUser = function(id) {
	return this.getUsers().filter("id", id, true);
}

exports.isUserID = function(id) {
 	return ((id + "").length === 17 && !isNaN(id));
}

exports.Client.prototype.addPM = function(pm) {
	this.PMList.add(pm);
}