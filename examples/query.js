/**
 * código de exemplo que mostra como o bot acessa e pesquisa por logs
 * de um canal específico. especificamente, retorna a última mensagem
 * do usuário fornecido dentre as últimas 100 mensagens do canal
 */

var Discord = require("discord.js");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

bot.on("message", function(message) {
    // reagir para todas as mensagens cujo conteúdo seja "$query"
    if (message.content.startsWith("$query")) {
        // obtém o canal para quais os logs devem ser acessados
        var channel = message.channel;

        // encontra todos os argumentos para o comando
        var arguments = message.content.split(" ");

        // obtém o primeiro argumento especificamente, onde contenha
        // o nome de usuário a ser queriado
        var username = arguments.slice(1).join(" ");

        // deixa o handler de evento a não ser que o usuário exista
        if (!username) {
            bot.sendMessage(channel, "esse usuário não existe.");

            return;
        }

        // a função getchannellogs() obtém o canal que deve ser acessado,
        // a quantidade de mensagens e um callback para seus argumentos
        bot.getChannelLogs(channel, 100, function(messageList) {
            // filter() obtém três argumentos, a chave a ser filtrada (nesse
            // caso o nome de usuário, "username"), o valor a ser observado
            // (true) ou uma lista de todos os encontros (false)
            var message = messageList.filter("username", username, true);

            // apenas continuar caso a mensagem tenha sido encontrada
            if (message) {
                bot.sendMessage(channel, "a última mensagem do usuário " + username + " é: \"" + message.content + "\".")
            } else {
                bot.sendMessage("esse usuário não enviou uma mensagem " + "para as últimas 100 mensagens")
            }
        });
    }
});