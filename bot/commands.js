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
        ], function(err) {
            if (err)
                console.log(err);
        });
    }
}

Commands["loading"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var progress = 0;
        var currentMessage;
        var bars = 20;

        function getM() {
            var before = progress;
            var after = bars - progress;
            var ret = "";

            for (x = 0; x < before; x++) {
                ret += "-";
            }

            ret += "**#**";

            for (y = 0; y < after; y++) {
                ret += "-";
            }

            return ret;
        }

        function doProg() {
            if (progress === (bars + 1)) {
                progress = 0;
            }

            if (currentMessage) {
                bot.updateMessage(currentMessage, getM(), function(err, msg) {
                    if (!err)
                        currentMessage = msg;
                });

                progress++;
            }
        }

        bot.sendMessage(message.channel, getM(), function(err, message) {
            currentMessage = message;

            setInterval(doProg, 200);
        });
    }
}

Commands["flashy"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var phase = 0;
        var msg;

        var textToSay = getKey(params, "m", "FLASH");
        var speed = parseInt(getKey(params, "s", "500"));

        function change() {
            if (msg) {
                var highlighting = ((phase % 2) === 0 ? "**" : "");

                phase++;

                bot.updateMessage(msg, highlighting + textToSay + highlighting, function(err, message) {
                    if (!err) {
                        msg = message;
                    }
                });
            }
        }

        bot.sendMessage(message.channel, textToSay, function(err, message) {
            msg = message;

            setInterval(change, speed);
        });
    }
}

Commands["echo"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        bot.sendMessage(message, params.join(" "), function(err, msg) {
            if (err) {
                bot.sendMessage(message, "não foi possível fazer eco...");

                console.log(err);
            }
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
                                    message,
                                    "feito! " + deletedCount + " mensagem(ns) foram deletadas, com " + failedCount + "erro(s).",
                                    false, {
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

Commands["feedback"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var amount = getKey(params, "amount") || getKey(params, "n") || 1000;

        bot.getChannelLogs(message.channel, amount, function(err, logs) {
            console.log(logs);

            if (err) {
                bot.reply(message, "ocorreu um erro ao capturar os logs...", false, {
                    selfDestruct: 3000
                });
            } else {
                var found = [];

                for (msg of logs.contents) {
                    if (~msg.content.indexOf("[request") || ~msg.content.indexOf("[feature" || ~msg.content.indexOf("[suggestion"))) {
                        if (msg.content.length > 10) {
                            found.push(msg);
                        }
                    }
                }

                bot.sendMessage(message.author, "ok, aqui está um resumo de todas as solicitações de features até agora:", function(err, ms) {
                    if (!err)
                        gothroughit();
                });

                bot.reply(message, "eu encontrei " + found.length + "resultado(s) que coincidem com isso. te enviarei na sua dm", false, {
                    selfDestruct: 3000
                });

                function gothroughit() {
                    for (msg of found) {
                        bot.sendMessage(message.author, "**" + msg.author.username + "** falou:\n    " + msg.content);
                    }
                }
            }
        });
    }
}

Commands["acceptinvite"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var inv = getKey(params, "i");

        bot.joinServer(inv, function(err, server) {
            if (err) {
                bot.reply(message, "não foi possível entrar nesse servidor...");
            } else {
                bot.reply(message, "eu entrei no servidor **" + server.name + "**, que possui " + server.channels.length() + " canais e " + server.members.length() + "membros.");
            }
        });
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

Commands["annoy"] = {
    oplevel: 0,

    fn: function(bot, params, message) {
        var user = getUser(message, params);

        bot.sendMessage(user, message.author.mention() + "me enviou aqui para te incomodar");
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
                var usernames = {};

                for (id in activity) {
                    usernames[id] = bot.getUser(id).username;
                }

                for (id in activity) {
                    report += username[id] + " | " + activity[id] + " | **" + Math.round((activity[id] / count) * 100) + "%**.\n";
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