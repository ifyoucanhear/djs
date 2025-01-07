// caso o discord.js não tenha sido clonado, alterar o parâmetro
// `require` para `discord.js` e então, rodar `npm install --save
// discord.js` no mesmo diretório do arquivo. o bot irá rodar
var Discord = require("../");

// carregue o arquivo de configuração. caso ainda não tenha, crie
// um que siga essa estrutura: { "email": "test@test.com", "password":
// "password123456" }
var BotConfig = require("./config.json");

// cria um novo client do discord
var bot = new Discord.Client();

// log o cliente utilizando detalhes de auth no config.json
bot.login(BotConfig.email, BotConfig.password);

console.log("inicializando tudo...");

// quando o bot estiver pronto, output no console
bot.on("ready", function() {
    console.log("tudo pronto");
});

// quando o bot for desconectado, encerrar tudo
bot.on("disconnected", function(obj) {
    // avisar que não pôde ser conectado e então encerrar
    console.log("desconectado - ", obj.reason);

    process.exit(0);
});

bot.on("message", function(message) {
    console.log(message);
});