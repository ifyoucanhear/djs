class Server {
    constructor(data, client) {
        this.client = client;
        this.region = data.region;
        this.ownerID = data.owner_id;
        this.name = data.name;
        this.id = data.id;
        this.members = new Map();
        this.channels = new Map();
        this.icon = data.icon;
        this.afkTimeout = data.afk_timeout;
        this.afkChannelId = data.afk_channel_id;

        for (var member of data.members) {
            this.members.add(client.addUser(member));
        }

        for (var channel of data.channels) {
            this.channels.add(client.addChannel(channel));
        }
    }

    get iconURL() {
		if (!this.icon)
			return null;

		return `https://discordapp.com/api/guilds/${this.id}/icons/${this.icon}.jpg`;
	}

	get afkChannel() {
		if (!this.afkChannelId)
			return false;

		return this.getChannel("id", this.afkChannelId);
	}

	get defaultChannel() {
		return this.getChannel("name", "general");
	}

    // get/set
    getChannel(key, value) {
		for (var channel of this.channels) {
			if (channel[key] === value) {
				return channel;
			}
		}

		return null;
	}
	
	getMember(key, value){
		for (var member of this.members) {
			if (member[key] === value) {
				return member;
			}
		}

		return null;
	}
}

module.exports = Server;