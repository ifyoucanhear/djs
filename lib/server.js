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

var Server = (function() {
    function Server(data, client) {
        _classCallCheck(this, Server);

        this.client = client;
        this.region = data.region;
        this.ownerID = data.owner_id;
        this.name = data.name;
        this.id = data.id;
        this.members = new Set();
        this.channels = new Set();
        this.icon = data.icon;
        this.afkTimeout = data.afk_timeout;
        this.afkChannelId = data.afk_channel_id;

        var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

        try {
			for (var _iterator = data.members[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var member = _step.value;

				// first we cache the user in our Discord Client,
				// then we add it to our list. This way when we
				// get a user from this server's member list,
				// it will be identical (unless an async change occurred)
				// to the client's cache.
				this.members.add(client.addUser(member.user));
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = data.channels[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var channel = _step2.value;

				this.channels.add(client.addChannel(channel, this.id));
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
					_iterator2["return"]();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
    }

    _createClass(Server, [{
		key: "getChannel",

		// get/set
		value: function getChannel(key, value) {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.channels[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var channel = _step3.value;

					if (channel[key] === value) {
						return channel;
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
						_iterator3["return"]();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			return null;
		}
	}, {
		key: "getMember",
        
		value: function getMember(key, value) {
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.members[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var member = _step4.value;

					if (member[key] === value) {
						return member;
					}
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
						_iterator4["return"]();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			return null;
		}
	}, {
		key: "iconURL",

		get: function get() {
			if (!this.icon)
                return null;

			return "https://discordapp.com/api/guilds/" + this.id + "/icons/" + this.icon + ".jpg";
		}
	}, {
		key: "afkChannel",

		get: function get() {
			if (!this.afkChannelId)
                return false;

			return this.getChannel("id", this.afkChannelId);
		}
	}, {
		key: "defaultChannel",

		get: function get() {
			return this.getChannel("name", "general");
		}
	}, {
		key: "owner",

		get: function get() {
			return this.client.getUser("id", this.ownerID);
		}
	}]);

	return Server;
})();

module.exports = Server;