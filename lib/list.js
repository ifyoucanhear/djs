/**
 * semelhante a um conjunto java. não contém elementos duplicados e inclui funções de filtro.
 * discrimina entre elementos com base em um discriminador passado quando criado. geralmente "id"
 * 
 * @class List
 */
exports.List = function(discriminator, cap) {
    /**
     * o que usar para distinguir duplicatas
     * 
     * @attribute discriminator
     * 
     * @type {String}
     */
    this.discriminator = discriminator;

    /**
     * a quantidade máxima de elementos permitidos na lista
     * 
     * @default Infinity
     * 
     * @attribute cap
     * 
     * @type {Number}
     */
    this.cap = cap || Number.MAX_SAFE_INTEGER;

    /**
     * a versão array da lista
     * 
     * @type {Array}
     * 
     * @attribute contents
     */
    this.contents = [];
}

/**
 * adiciona um elemento à lista se ainda não estiver lá
 * 
 * @method add
 * 
 * @param {Object/Array} element o(s) elemento(s) a ser(em) adicionado(s)
 * 
 * @example
 *     List.add(obj);
 *     List.add([obj, obj, obj]);
 */
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

        if (self.filter(self.discriminator, child[self.discriminator]).length() === 0)
            self.contents.push(child);
    }
}

/**
 * retorna o tamanho da lista
 * 
 * @method length
 * 
 * @return {Number}
 */
exports.List.prototype.length = function() {
    return this.contents.length;
}

/**
 * obtém o índice de um elemento na lista ou o padrão é falso
 * 
 * @param {Object} object o elemento do qual será obtido tal index
 * 
 * @return {Number/Boolean} o index do objeto que está na lista, ou então, false
 * 
 * @method getIndex
 */
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

/**
 * remove um elemento no index específico
 * 
 * @param {Number} index
 * 
 * @method removeIndex
 */
exports.List.prototype.removeIndex = function(index) {
    this.contents.splice(index, 1);
}

/**
 * remove um elemento da lista
 * 
 * @param {Object} element
 * 
 * @method removeElement
 * 
 * @return {Boolean} se a operação foi realizada com sucesso ou não
 */
exports.List.prototype.removeElement = function(child) {
    for (_element in this.contents) {
		var element = this.contents[_element];

		if (child[this.discriminator] == element[this.discriminator]) {
			this.removeIndex(_element, 1);

            return true;
		}
	}

    return false;
}

/**
 * substitui um elemento da lista por um elemento especificado
 * 
 * @method updateElement
 * 
 * @param {Object} element o elemento a ser atualizado
 * @param {Object} newElement um novo elemento
 * 
 * @return {Boolean} se a operação foi realizada com sucesso ou não
 */
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

exports.List.prototype.filter = function(key, value, onlyOne, caseInsen) {
    var results = [];

    value = change(value);

    for (index in this.contents) {
        var child = this.contents[index];

        if (change(child[key]) == value) {
            if (onlyOne) {
                return child;
            } else {
                results.push(child);
            }
        }
    }

    function change(val) {
        if (caseInsen) {
            val = val.toUpperCase();
        }

        return val;
    }

    if (onlyOne) {
        return false;
    }

    var retList = new exports.List(this.discriminator);

    retList.contents = results;

    return retList;
}

exports.List.prototype.getValues = function(key) {
    var valList = [];

    for (child of this.contents) {
        valList.push(child[key]);
    }

    return valList;
}

exports.List.prototype.deepFilter = function(keys, value, onlyOne, caseInsen) {
	var results = [];
    
    value = change(value);

	for (index in this.contents) {
		var child = this.contents[index];
		var buffer = child;

		for (key of keys) {
            if (buffer instanceof exports.List) {
                buffer = buffer.contents;
            }

            if (buffer instanceof Array) {
                for (elem of buffer) {
                    if (change(elem[key]) == value) {
                        buffer = elem;
                    }
                }
            }

			buffer = buffer[key];
		}

		if (change(buffer) == value) {
			if (onlyOne) {
				return child;
			} else {
				results.push(child);
			}
		}
	}

    function change(val) {
        if (caseInsen) {
            val = val.toUpperCase();
        }

        return val;
    }

	if (onlyOne) {
		return false;
	}

    var retList = new exports.List(this.discriminator);

    retList.contents = results;
    
	return retList;
}