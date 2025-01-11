"use strict";

var _createClass = (function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];

            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;

            if ("value" in descriptor)
                descriptor.writable = true;

            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);

        if (staticProps)
            defineProperties(Constructor, staticProps);

        return Constructor;
    }
})();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("não é possível chamar uma classe como uma função");
    }
}

var request = require("superagent");

var defaultOptions = {
    cache_tokens: false
};

var Client = (function() {
    function Client() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? defaultOptions : arguments[0];
        var token = arguments.length <= 1 || arguments[1] === undefined ? defaultOptions : arguments[1];

        _classCallCheck(this, Client);

        /**
         * quando criado, caso haja um token especificado, o client
         * irá tentar conectar com isso. se o token é incorreto, não
         * será realizado nenhum effort para conexão
         */
        this.options = options;
        this.token = token;
        this.state = 0;
        this.websocket = null;
        this.events = new Map();
        this.user = null;

        /**
         * valores de estado:
         * 
         * 0 - ausente
         * 1 - iniciando sessão
         * 2 - logado
         * 3 - pronto
         * 4 - desconectado
         */
    }

    _createClass(Client, [{
        key: "login",

        // login padrão
        value: function login() {
            var email = arguments.length <= 0 || arguments[0] === undefined ? "test@test.com" : arguments[0];
            var password = arguments.length <= 1 || arguments[1] === undefined ? "password123456" : arguments[1];

            if (this.state === 0 || this.state === 4) {
                this.state = 1;

                request.post();
            }
        }
    }, {
        key: "ready",

        get: function get() {
            return this.state === 3;
        }
    }]);

    return Client;
})();