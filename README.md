# discord.js

a node module that allows you to interface with the [discord](https://discordapp.com/) api for creation of things such as bots or loggers

## installation

```bash
npm install discord.js
```

## example usage

```js
var Discord = require("discord.js");
var myBot = new Discord.Client();

myBot.login("email", "password", function(e) {
    if (e) {
        console.log("não foi possível iniciar sua sessão");

        return;
    }

    myBot.on("disconnected", function() {
        console.log("desconectado");

        process.exit(0);
    });

    myBot.on("ready", function() {
        console.log("tudo pronto");
    });
    
    myBot.on("message", function(message) {
        if (message.content === "ping") {
            myBot.sendMessage(message.channel, "pong");
        }
    })
})
```

## todo

* documentação
* melhor reação para erros
* armazenamento de novos servidores e canais
