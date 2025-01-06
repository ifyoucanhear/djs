var Discord = require("discord.js");

// criação do bot
var bot = new Discord.Client();

// logando o bot com um email e senha de exemplo
bot.login("test@test.com", "password123456");

bot.on("message", function(message) {
    // reage com todas as mensagens cujo conteúdo seja "$formatting"
    if (message.content === "$formatting") {
        bot.sendMessage(message.channel, "**negrito** ****semi-negrito**** *itálico* " + "_**negrito e itálico**_ __underline__ ~~strikethrough~~");
    }
});