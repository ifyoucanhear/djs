/**
 * código de exemplo que mostra como o bot escuta pelos eventos de mudança
 * de presença, como um usuário entrando ou deixando algum canal
 */

var Discord = require("../");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

// o evento "ready" é alertado quando o bot for conectado com sucesso
// ao discord e estiver pronto para ser utilizado
bot.on("ready", function() {
    console.log("bot conectado com sucesso");
});

// o evento "presence" é alertado quando um usuário entra no servidor, deixa ou vai embora
bot.on("presence", function(user, status, server) {
    // envia uma mensagem no canal padrão do servidor, onde as
    // atualizações de presença não estão desativadas
    var message = user.mention() + " é " + status + " em " + server.name + "!";

    console.log(message);

    this.sendMessage(server.getDefaultChannel(), message);
});