"use strict";

var request = require("superagent");
var Endpoints = require("./endpoints.js");

var Internal = {};

Internal.XHR = {};
Internal.WebSocket = {};

Internal.WebSocket.properties = {
    "$os": "discord.js",
	"$browser": "discord.js",
	"$device": "discord.js",
	"$referrer": "",
	"$referring_domain": ""
};

Internal.XHR.login = function(email, password, callback) {
    request
        .post(Endpoints.LOGIN)
        .send({
            email: email,
            password: password
        })
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body.token);
            }
        });
}

Internal.XHR.logout = function(token, callback) {
    request
        .post(Endpoints.LOGOUT)
        .end(function(err, res) {
            err ? callback(err) : callback(null);
        });
}

Internal.XHR.createServer = function(token, name, region, callback) {
    request
        .post(Endpoints.SERVERS)
        .set("authorization", token)
        .send({
            name: name,
            region: region
        })
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.leaveServer = function(token, serverId, callback) {
    request
        .del(Endpoints.SERVERS + "/" + serverId)
        .set("authorization", token)
        .end(function(err, res) {
            err ? callback(err) : callback(null);
        });
}

Internal.XHR.createInvite = function(token, channelId, options, callback) {
    request
        .post(Endpoints.CHANNELS + "/" + channelId + "/invites")
        .set("authorization", token)
        .send(options)
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        })
}

Internal.XHR.startPM = function(token, selfID, userID, callback) {
    request
        .post(Endpoints.USERS + "/" + selfID + "/channels")
        .set("authorization", token)
        .send({
            recipient_id: userID
        })
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.sendMessage = function(token, channelID, messageParameters, callback) {
    request
        .post(Endpoints.CHANNELS + "/" + channelID + "/messages")
        .set("authorization", token)
        .send(messageParameters)
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.sendFile = function(token, channelID, file, fileName, callback) {
    request
        .post(Endpoints.CHANNELS + "/" + channelID + "/messages")
        .set("authorization", token)
        .attach("file", file, fileName)
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.deleteMessage = function(token, channelID, messageID, callback) {
    request
        .del(Endpoints.CHANNELS + "/" + channelID + "/messages/" + messageID)
        .set("authorization", token)
        .end(function(err) {
            err ? callback(err) : callback(null);
        });
}

Internal.XHR.updateMessage = function(token, channelID, messageID, messageParameters, callback) {
    request
    .patch(Endpoints.CHANNELS + "/" + channelID + "/messages/" + messageID)
    .set("authorization", token)
    .send(messageParameters)
    .end(function(err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null, res.body);
        }
    });
}

Internal.XHR.getChannelLogs = function(token, channelID, amount, callback) {
    request
        .get(Endpoints.CHANNELS + "/" + channelID + "/messages?limit=" + amount)
        .set("authorization", token)
        .send(messageParameters)
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.createChannel = function(token, serverID, name, type, callback) {
    request
        .post(Endpoints.SERVERS + "/" + serverID + "/channels")
        .set("authorization", token)
        .send({
            name: name,
            type: type
        })
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.deleteChannel = function(token, channelID, callback) {
    request
        .del(Endpoints.CHANNELS + "/" + channelID)
        .set("authorization", token)
        .end(function(err) {
            err ? callback(err) : callback(null);
        });
}

Internal.XHR.deleteServer = function(token, serverID, callback) {
    request
        .del(Endpoints.SERVERS + "/" + serverID)
        .set("authorization", token)
        .end(function(err) {
            err ? callback(err) : callback(null);
        });
}

Internal.XHR.getChannels = function(token, serverID, callback) {
    request
        .get(Endpoints.SERVERS + "/" + serverID + "/channels")
        .set("authorization", token)
        .end(function(err) {
            err ? callback(err) : callback(null);
        });
}

Internal.XHR.getServer = function(token, serverID, callback) {
    request
        .del(Endpoints.SERVERS + "/" + serverID)
        .set("authorization", token)
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.acceptInvite = function(token, inviteID, callback) {
    request
        .post(Endpoints.API + "/invite/" + inviteID)
        .set("authorization", token)
        .end(function(err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.body);
            }
        });
}

Internal.XHR.setUsername = function(token, avatar, email, newPassword, password, username, callback) {
    request
        .patch(Endpoints.API + "/users/@me")
        .set("authorization", token)
        .send({
            avatar: avatar,
            email: email,
            new_password: new_password,
            password: password,
            username: username
        })
        .end(function(err) {
            callback(err);
        });
}

exports.Internal = Internal;