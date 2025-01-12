class User {
    constructor(data) {
        this.username = data.username;
		this.discriminator = data.discriminator;
		this.id = data.id;
		this.avatar = data.avatar;
    }

    // acessar utilizando user.avatarurl;
    get avatarURL() {
        if (!this.avatar)
            return null;

        return `https://discordapp.com/api/users/${this.id}/avatars/${this.avatar}.jpg`;
    }

    mention() {
        return `<@${this.id}>`;
    }

    toString() {
        return this.mention();
    }

    equals(object) {
        return object.id === this.id;
    }
}

module.exports = User;