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

bot.on("message", function(message) {
    // reage com todas as mensagens cujo conteúdo seja "$formatting"
    if (message.content === "$formatting") {
        this.sendMessage(message.channel, "**negrito** ****semi-negrito**** *itálico* " + "_**negrito e itálico**_ __underline__ ~~strikethrough~~");
    }
});