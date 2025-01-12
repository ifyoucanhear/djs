class Channel {
    constructor(data, server) {
        this.server = server;
        this.name = data.name;
        this.type = data.type;
        this.id = data.id;
        // this.isPrivate = this.isPrivate;
    }
    
    get client() {
        return this.server.client;
    }

    equals(object) {
        return object.id === this.id;
    }
}

module.exports = Channel;