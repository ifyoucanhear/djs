/**
 * código de exemplo que mostra como o bot, mesmo não interagindo com o
 * discord, escuta pelos eventos "ready" e "disconnected", que são alertados
 * quando o bot é inicializado ou encerrado, respectivamente
 */

var Discord = require("discord.js");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

// o evento "ready" é alertado depois do bot ser conectado com sucesso
// ao discord e quando estiver pronto para enviar mensagens
bot.on("ready", function() {
    console.log("bot conectado com sucesso.");
});

// o evento "disconnected" é alertado depois da conexão ao discord ser encerrada
bot.on("disconnected", function() {
    console.log("bot desconectado do discord.");
});