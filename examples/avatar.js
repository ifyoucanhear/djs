/**
 * código de exemplo que mostra como o bot menciona usuários nas mensagens
 * e como acessar os avatares dos usuários
 */

var Discord = require("../");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

// o evento "ready" é alertado quando o bot for conectado com sucesso
// ao discord e estiver pronto para ser utilizado
bot.on("ready", function() {
    console.log("bot conectado com sucesso");
});

bot.on("message", function(message) {
    // reage com todas as mensagens cujo o conteúdo seja "$avatar"
    if (message.content === "$avatar") {
        // obtém o usuário que solicitou seu avatar
        var user = message.author;

        // checa se o usuário de fato possui um avatar
        if (user.avatar) {
            // constró o url do avatar do usuário com seu id
            var url = "https://discordapp.com/api/users/" + user.id + "/avatars/" + user.avatar + ".jpg";

            // um usuário pode ser mencionado na mensagem inserindo a string obtida
            this.sendMessage(message.channel, message.author.mention() + ", avatar: " + url);
        } else {
            // nada deve ser feito caso o usuário não possua um avatar
            this.sendMessage(message.channel, message.author.mention() + ", não possui um avatar...");
        }
    }
});