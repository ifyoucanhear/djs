exports.List = function(discriminator, cap) {
    this.discriminator = discriminator;
    this.cap = cap || Number.MAX_SAFE_INTEGER;
    this.contents = [];
}

exports.List.prototype.add = function(child) {
    var self = this;

    if (child.constructor === Array) {
        children = child;

        for (child of children) {
            addChild(child);
        }
    } else {
        addChild(child);
    }

    function addChild(child) {
        if (self.length() > self.cap) {
            self.splice(0, 1);
        }

        if (self.filter(self.discriminator, child[self.discriminator]).length === 0)
            self.contents.push(child);
    }
}

exports.List.prototype.length = function() {
    return this.contents.length;
}

exports.List.prototype.getIndex = function(object) {
    var index = false;

    for (elementIndex in this.contents) {
        var element = this.contents[elementIndex];

        if (element[this.discriminator] == object[this.discriminator]) {
            return elementIndex;
        }
    }

    return index;
}

exports.List.prototype.removeIndex = function(index) {
    this.contents.splice(index, 1);
}

exports.List.prototype.removeElement = function(child) {
    for (_element in this.contents) {
		var element = this.contents[_element];

		if (child[this.discriminator] == element[this.discriminator]) {
			this.removeIndex(_element, 1);
		}
	}

    return false;
}

exports.List.prototype.updateElement = function(child, newChild) {
    for (_element in this.contents) {
		var element = this.contents[_element];

		if (child[this.discriminator] == element[this.discriminator]) {
			this.contents[_element] = newChild;

            return true;
		}
	}

    return false;
}

exports.List.prototype.concatSublists = function(whereList, discriminator) {
    // olhar os conteúdos, e assumir que neles, há todas as listas
    var concatList = new exports.List(discriminator);

    for (item of this.contents) {
        var itemList = item[whereList];

        concatList.add(itemList.contents);
    }

    return concatList;
}

exports.List.prototype.filter = function(key, value, onlyOne) {
    var results = [];

    for (index in this.contents) {
        var child = this.contents[index];

        if (child[key] == value) {
            if (onlyOne) {
                return child;
            } else {
                results.push(child);
            }
        }
    }

    if (onlyOne) {
        return false;
    }

    return results;
}

exports.List.prototype.deepFilter = function(keys, value, onlyOne) {
	var results = [];

	for (index in this.contents) {
		var child = this.contents[index];
		var buffer = child;

		for(key of keys) {
			buffer = buffer[key];
		}

		if (buffer == value) {
			if (onlyOne) {
				return child;
			} else {
				results.push(child);
			}
		}
	}

	if (onlyOne) {
		return false;
	}
    
	return results;
}