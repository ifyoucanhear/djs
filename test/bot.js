var Discord = require("../lib/index");

var bot = new Discord.Client();

bot.login("email", "pass", function(err, res) {});

bot.on("ready", function() {
    console.log("pronto!");
});