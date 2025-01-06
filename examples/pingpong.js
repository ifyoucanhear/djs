/**
 * código de exemplo que mostra como o bot conecta na conta discord e
 * escuta pelas mensagens, enviando outras de volta
 * 
 * ele responde com "pong" para cada mensagem "ping"
 */

var Discord = require("../");

// criação do bot
var bot = new Discord.Client();

// logando o bot com um email e senha de exemplo
bot.login("test@test.com", "password123456");

// o evento "ready" é alertado quando o bot for conectado com sucesso
// ao discord e estiver pronto para ser utilizado
bot.on("ready", function() {
    console.log("bot conectado com sucesso");
});

// adição de um listener para o evento "message"
bot.on("message", function(message) {
	// acessa o conteúdo da mensagem como uma string;
	// se valer "ping", então o bot responderá com "pong"
	if (message.content === "ping") {
		// envia a mensagem "pong" no canal onde a mensagem foi enviada
		this.sendMessage(message.channel, "pong");
	}
});