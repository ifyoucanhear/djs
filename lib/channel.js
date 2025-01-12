"use strict";

var _createClass = (function () {
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
    
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        
        if (staticProps)
            defineProperties(Constructor, staticProps);
        
        return Constructor;
    };
})();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("não é possível chamar uma classe como uma função");
    }
}

var Channel = (function() {
    function Channel(data, server) {
        _classCallCheck(this, Channel);

        this.server = server;
        this.name = data.name;
        this.type = data.type;
        this.id = data.id;
        // this.isPrivate = isPrivate;
    }

    _createClass(Channel, [{
        key: "equals",

        value: function equals(object) {
            return object.id === this.id;
        }
    }, {
        key: "client",

        get: function get() {
            return this.server.client;
        }
    }]);

    return Channel;
})();

module.exports = Channel;