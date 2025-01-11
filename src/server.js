var User = require("./user.js").User;
var List = require("./list.js").List;

/**
 * um wrapper para informações do servidor também contém canais e usuários.
 * os devs não devem instanciar a classe, em vez disso devem manipular os
 * objetos server fornecidos a eles
 * 
 * @class Server
 * 
 * @param {String} region a região do servidor
 */
exports.Server = function(region, ownerID, name, id, members, icon, afkTimeout, afkChannelId) {
    /**
     * a região do servidor
     * 
     * @type {String}
     * 
     * @attribute region
     */
    this.region = region;

    /**
     * o id do dono do servidor (não um usuário)
     * 
     * @type {String}
     * 
     * @attribute ownerID
     */
    this.ownerID = ownerID;

    /**
     * o nome do servidor
     * 
     * @type {String}
     * 
     * @attribute name
     */
    this.name = name;

    /**
     * o id do servidor
     * 
     * @type {String}
     * 
     * @attribute id
     */
    this.id = id;

    /**
     * lista contendo membros do servidor
     * 
     * @param {List}
     * 
     * @attribute members
     */
    this.members = new List("id");

    /**
     * lista contendo os canais do servidor
     * 
     * @param {List}
     * 
     * @attribute channels
     */
    this.channels = new List("id");

    /**
     * id do ícone do servidor
     * 
     * @param {String}
     * 
     * @attribute icon
     */
    this.icon = icon;

    /**
     * a quantidade de segundos que deverão passar do usuário
     * 
     * @type {Number}
     * 
     * @attribute afkTimeout
     */
    this.afkTimeout = afkTimeout;

    /**
     * o id do canal afk
     * 
     * @type {String}
     * 
     * @attribute afkChannelId
     */
    this.afkChannelId = afkChannelId;

    for (x in members) {
        var member = members[x].user;

        this.members.add(new User(member));
    }
};

/**
 * retorna um url válido apontando para o ícone do servidor, caso haja um
 * 
 * @method getIconURL
 * 
 * @return {String/Boolean} caso tenha um ícone, o url é retornado. caso não, false é retornado
 */
exports.Server.prototype.getIconURL = function() {
    if (!this.icon)
        return false;

    return "https://discordapp.com/api/guilds/" + this.id + "/icons/" + this.icon + ".jpg";
};

/**
 * retorna o canal afk caso o servidor tenha um
 * 
 * @method getAFKChannel
 * 
 * @return {Channel/Boolean} caso tenha um canal afk, o canal é retornado. caso não, false é retornado
 */
exports.Server.prototype.getAFKChannel = function() {
    if (!this.afkChannelId)
        return false;

    return this.channels.filter("id", this.afkChannelId, true);
};

/**
 * retorna o canal #general do servidor
 * 
 * @method getDefaultChannel
 * 
 * @return {Channel} retorna o canal #general do servidor
 */
exports.Server.prototype.getDefaultChannel = function() {
    return this.channels.filter("name", "general", true);
};