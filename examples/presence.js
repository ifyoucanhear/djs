var Discord = require("discord.js");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

bot.on("presence", function(user, status, server) {
    bot.sendMessage(server.getDefaultChannel(), user.mention() + " is " + status + "!");
});