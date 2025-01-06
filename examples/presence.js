/**
 * código de exemplo que mostra como o bot escuta pelos eventos de mudança
 * de presença, como um usuário entrando ou deixando algum canal
 */

var Discord = require("discord.js");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

// o evento "presence" é alertado quando um usuário entra no servidor, deixa ou vai embora
bot.on("presence", function(user, status, server) {
    // envia uma mensagem no canal padrão do servidor, onde as
    // atualizações de presença não estão desativadas
    bot.sendMessage(server.getDefaultChannel(), user.mention() + " is " + status + "!");
});