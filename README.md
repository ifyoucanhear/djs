# discord.js

a node module that allows you to interface with the [discord](https://discordapp.com/) api for creation of things such as bots or loggers.

the aim of this api is to make it *really* simple to start developing your bots. this api has server, channel and user tracking, as well as tools to make identification really simple.

new update features **big speed boosts** (everything cached and sorted with around 1 second of calling the login function) upon connection and allows editing of messages.

## esse módulo ainda está em alpha - especialmente as novas versões

this node module is still in alpha, and some methods and functions may change or completely disappear

## installation

```bash
npm install --save discord.js
```

## features

* envie, receba, exclua e **edite** mensagens de canais _e_ dms! inicia automaticamente uma dm para você
* criar, excluir e sair de servidores e canais
* criar convites para servidores
* menção silenciosa - aciona uma notificação de menção sem realmente @mentioning um usuário
* obtenha metadados completos sobre usuários, canais e servidores - incluindo avatares
* obtenha logs ilimitados de canais
* caching rápido e eficiente
* auto-cache mensagens

## example usage

```js
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
```

## todo

* entrar em servidores por meio de convite
* suporte para stealthy ninja
