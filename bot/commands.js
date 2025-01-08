var Authority = require("./authority.js");
var BotClass = require("./bot.js");
var Discord = BotClass.Discord;

Commands = [];

Commands["info"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var verbose = hasFlag(params, "verbose") || hasFlag(params, "v");
        var user = getUser(message, params);

        bot.reply(message, [
            "aqui algumas informações de " + user.mention() + ":",
            "no canal **#" + message.channel.name + "**" + (verbose ? " - id *" + message.channel.id + "*" : ""), (message.isPM() ? "você está em uma conversa privada comigo" + (verbose ? " o id é " + message.channel.id : "") : "no servidor **" + message.channel.server.name + "**" + (verbose ? " - id *" + message.channel.server.id + "*" : "")),
            "id de usuário é *" + user.id + "*",
            "autoridade/level op para mim é **" + Authority.getLevel(user) + "**"
        ]);
    }
}

Commands["echo"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        bot.sendMessage(message, params.join(" "), function(err, msg) {
            if (err)
                bot.sendMessage(message, "não foi possível fazer eco...");
        });
    }
}

Commands["auth"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var level = getKey(params, "level", "0");
		var method = hasFlag(params, "set") ? "set" : "get";
		var user = getUser(message, params);

        if (method === "set") {
            if (authLevel(message.author) <= level) {
				bot.reply(message, "esse nível de autoridade é muito alto para você definir.");
			} else if (user.equals(message.author)) {
				bot.reply(message, "você não pode alterar seu próprio nível de autoridade.");
			} else if (authLevel(user) >= authLevel(message.author)) {
				bot.reply(message, "esse usuário tem um nível op mais alto ou igual ao seu.");
			} else if (level < 0) {
                bot.reply(message, "esse nível é muito baixo para isso...");
            } else {
				setAuthLevel(user, level);

				bot.reply(message, "eu estabeleci a autoridade de " + user.mention() + " para **" + level + "**");
			}
        } else {
            bot.reply(message, user.equals(message.author) ? "seu nível de autoridade é **" + authLevel(user) + "**" : "o nível de autoridade de " + user.mention() + " é **" + authLevel(user) + "**");
        }
    }
}

Commands["clear"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        if (!message.isPM()) {
            if (authLevel(message.author) < 1) {
                bot.reply(message, BotClass.AUTH_ERROR);

                return;
            }
        }

        var initMessage = false,
            cleared = false;

        bot.getChannelLogs(message.channel, 250, function(err, logs) {
            if (err) {
                bot.sendMessage("não foi possível obter registros para excluir mensagens.");
            } else {
                var deletedCount = 0,
                    failedCount = 0,
                    todo = logs.length();

                for (msg of logs.contents) {
                    if (msg.author.equals(bot.user)) {
                        bot.deleteMessage(msg, function(err) {
                            todo--;

                            if (err)
                                failedCount++;
                            else
                                deletedCount++;

                            if (todo === 0) {
                                bot.reply(
                                    msg,
                                    "feito! " + deletedCount + " mensagem(ns) foram deletadas, com " + failedCount + "erro(s).",
                                    false,
                                    true, {
                                        selfDestruct: 5000
                                    }
                                );

                                cleared = true;

                                deleteInitMessage();
                            }
                        });
                    } else {
                        todo--;
                    }
                }
            }
        });

        bot.reply(message, "limpando minhas mensagens...", function(err, msg) {
            if (!err) {
                initMessage = msg;

                if (cleared)
                    deleteInitMessage();
            }
        });

        function deleteInitMessage() {
            if (initMessage) {
                bot.deleteMessage(initMessage);
            }
        }
    }
}

Commands["leave"] = {
    oplevel: 3,

    fn: function(bot, params, message) {
        var silent = hasFlag(params, "s") || hasFlag(params, "silent");

        if (message.isPM()) {
            bot.reply(message, "hmm... eu não posso deixar as pms...");
        } else {
            if (!silent)
                bot.reply(message, "ok, deixando...");

            bot.leaveServer(message.channel.server, function(err) {
                if (err) {
                    bot.reply(message, "ocorreu um erro ao sair do servidor, que estranho...");
                }
            });
        }
    }
}

Commands["avatar"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var user = getUser(message, params);

        if (!user.avatar) {
            bot.sendMessage(message.channel, user.mention() + "não possui um avatar...");
        } else {
            bot.reply(message, user.getAvatarURL());
        }
    }
}

Commands["icon"] = {
    oplevel: 0,
    
    fn: function(bot, params, message) {
        if (message.isPM()) {
            bot.reply(message, "pms não possui avatar...");

            return;
        }

        if (!message.channel.server.icon) {
            bot.reply(message, "esse servidor não possui um ícone...");

            return;
        }

        bot.reply(message, message.channel.server.getIconURL());
    }
}

Commands["remind"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var time = parseInt(getKey(params, "t") || getKey(params, "time")) * 1000 || 21000;
        var msg = getKey(params, "m") || getKey(params, "msg") || getKey(params, "message");

        bot.reply(message, "eu vou te lembrar de *" + msg + "* em *" + time / 1000 + "* segundos...", false, true, {
            selfDestruct: time
        });

        setTimeout(send, time);

        function send() {
            bot.sendMessage(message.author, time + " tempo. **" + msg + "**");
        }
    }
}

Commands["activity"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var amount = getKey(params, "amount") || getKey(params, "n") || 250;
        var limit = getKey(params, "limit") || getKey(params, "l") || 10;

        bot.getChannelLogs(message.channel, amount, function(err, logs) {
            if (err) {
                bot.reply(message, "erro ao obter logs...");
            } else {
                var activity = {}, count = 0;

                for (msg of logs.contents) {
                    count = logs.length();

                    if (!activity[msg.author.id])
                        activity[msg.author.id] = 0;

                    activity[msg.author.id]++;
                }

                var report = "aqui uma lista de atividade na última " + count + "de mensagens: \n\n";
                var users = {};

                for (id in activity) {
                    users[id] = message.channel.server.members.filter("id", id, true);
                }

                activity = Object.keys(activity).sort(function(a, b) {
                    return activity[a] - activity[b]
                });

                for (id in activity) {
                    report += id + " | " + activity[id] + " | **" + Math.round((activity[id] / count) * 100) + "%**.\n";
                }

                bot.reply(message, report, false, false);
            }
        });
    }
}

exports.Commands = Commands;

function hasFlag(array, flag) {
    return ~array.indexOf(flag);
}

function getKey(array, key, def) {
    for (element of array) {
        var chunks = element.split("=");

        if (chunks.length > 1) {
            if (chunks[0] == key) {
                return chunks[1];
            }
        }
    }

    return def;
}

function authLevel(user) {
	return Authority.getLevel(user);
}

function setAuthLevel(user, level) {
	Authority.setLevel(user, level);
}

function getUser(message, params) {
	var usr = false;

	if (!message.isPM()) {
		var wantedUser = getKey(params, "user", false) || getKey(params, "u", false);

		if (wantedUser) {
			usr = message.channel.server.members.filter(Discord.isUserID(wantedUser) ? "id" : "username", wantedUser, true);
		}
	}

	if (!usr)
		usr = message.author;

	return usr;
}