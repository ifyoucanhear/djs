var Discord = require("discord.js");
var bot = new Discord.Client();

bot.login("test@test.com", "password123456");

bot.on("message", function(message) {
    if (message.content === "$avatar") {
        var user = message.author; // o usuário que deseja um avatar no autor

        if (user.avatar) {
            var url = "https://discordapp.com/api/users/" + user.id + "/avatars/" + user.avatar + ".jpg";

            bot.sendMessage(message.channel, message.author.mention() + ", avatar: " + url);
        } else {
            bot.sendMessage(message.channel, message.author.mention() + ", não possui um avatar...");
        }
    }
});