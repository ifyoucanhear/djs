var Discord = require("../lib/index");

var bot = new Discord.Client();

bot.login("test@test.com", "password123456", function(err, res) {
    console.log(res);
});