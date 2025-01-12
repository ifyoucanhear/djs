var Discord = require("../lib/index");

var Auth = require("./auth.json");
var bot = new Discord.Client();

bot.login(Auth.email, Auth.password, function(err, res) {});

bot.on("ready", function() {
    console.log("pronto!");
});