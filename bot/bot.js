// caso o discord.js não tenha sido clonado, alterar o parâmetro
// `require` para `discord.js` e então, rodar `npm install --save
// discord.js` no mesmo diretório do arquivo. o bot irá rodar
var Discord = require("../");
exports.Discord = Discord;

// carregue o arquivo de configuração. caso ainda não tenha, crie
// um que siga essa estrutura: { "email": "test@test.com", "password":
// "password123456" }
var BotConfig = require("./config.json");

// carrega o arquivo de comandos
var Commands = require("./commands.js").Commands;

// carrega o handler de autoridade
var Authority = require("./authority.js");

// inicializar
Authority.init();

// cria um novo client do discord
var bot = new Discord.Client();

// um array de prefixos de caracteres únicos que o bot responderá
var commandPrefixes = ["$", "£", "`"];

// log o cliente utilizando detalhes de auth no config.json
bot.login(BotConfig.email, BotConfig.password);

console.log("inicializando tudo...");

var time = Date.now();

// quando o bot estiver pronto, output no console
bot.on("ready", function() {
    console.log("pronto em " + (Date.now() - time) + "ms");
    console.log(Commands);
});

// quando o bot for desconectado, encerrar tudo
bot.on("disconnected", function(obj) {
    // avisar que não pôde ser conectado e então encerrar
    console.log("desconectado - ", obj.reason);
    console.log(obj.error);

    process.exit(0);
});

bot.on("message", function(message) {
    // caso a mensagem não comece com um prefixo de comando válido, encerrar
    if (commandPrefixes.indexOf(message.content.charAt(0)) == -1)
        return;

    var command = "",
        params = []; // configura os detalhes da mensagem

    // remove o prefixo do início da mensagem
    message.content = message.content.substr(1);

    // divide a mensagem por barras. isso retornará em algo mais ou menos
    // assim: ["comando", "a", "b", "c"]
    var chunks = message.content.split("/");

    for (key in chunks) { // loop os chunks e aparar eles
        chunks[key] = chunks[key].trim();
    }

    command = chunks[0]; // o primeiro parâmetro será o comando
    params = chunks.slice(1);

    // é menos complicado se terceirizarmos para outra função
    handleMessage(command, params, message);
});

function handleMessage(command, params, message) {
    if (Commands[command]) {
        if (Authority.getLevel(message.author) >= Commands[command].oplevel) {
            // o usuário possui autoridade de fazer isso
            Commands[command].fn(bot, params, message);
        } else {
            // o usuário não possui autoridade
            bot.reply(message, exports.AUTH_ERROR);
        }
    } else {
        bot.reply(message, exports.NOT_FOUND);
    }
}

exports.AUTH_ERROR = "você não possui autoridade para realizar essa ação...";
exports.NOT_FOUND = "esse comando não foi encontrado...";