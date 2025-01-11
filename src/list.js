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

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                child = _step.value;

                addChild(child);
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
};

/**
 * retorna o tamanho da lista
 * 
 * @method length
 * 
 * @return {Number}
 */
exports.List.prototype.length = function() {
    return this.contents.length;
};

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
};

/**
 * remove um elemento no index específico
 * 
 * @param {Number} index
 * 
 * @method removeIndex
 */
exports.List.prototype.removeIndex = function(index) {
    this.contents.splice(index, 1);
};

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
};

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
};

exports.List.prototype.concatSublists = function(whereList, discriminator) {
    // olhar os conteúdos, e assumir que neles, há todas as listas
    var concatList = new exports.List(discriminator);

    var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

    try {
		for (var _iterator2 = this.contents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			item = _step2.value;

			var itemList = item[whereList];

			concatList.add(itemList.contents);
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

    return concatList;
};

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

    var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = this.contents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			child = _step3.value;

			valList.push(child[key]);
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

    return valList;
};

exports.List.prototype.deepFilter = function(keys, value, onlyOne, caseInsen) {
	var results = [];
    
    value = change(value);

	for (index in this.contents) {
		var child = this.contents[index];
		var buffer = child;

		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;
		try {
			for (var _iterator4 = keys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				key = _step4.value;
                
				if (buffer instanceof exports.List) {
					buffer = buffer.contents;
				}

				if (buffer instanceof Array) {
					var _iteratorNormalCompletion5 = true;
					var _didIteratorError5 = false;
					var _iteratorError5 = undefined;

					try {
						for (var _iterator5 = buffer[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							elem = _step5.value;

							if (change(elem[key]) == value) {
								buffer = elem;
							}
						}
					} catch (err) {
						_didIteratorError5 = true;

						_iteratorError5 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
								_iterator5["return"]();
							}
						} finally {
							if (_didIteratorError5) {
								throw _iteratorError5;
							}
						}
					}
				}

				buffer = buffer[key];
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
};