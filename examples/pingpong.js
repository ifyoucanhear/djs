var Discord = require("discord.js");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

bot.on("message", function(message) {
	if (message.content === "ping") {
		this.sendMessage(message.channel, "pong");
	}
});