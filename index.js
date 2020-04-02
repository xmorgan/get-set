/**
    @param {Any} value
    @returns {String}
*/
export const typeOf = (value) => ({}).toString.call(value).slice(8, -1);
export const defaultValueSymbol = Symbol("defaultValue");

export class GetSet {
    /**
        @param {Object<String, Array>} entries
        @returns {Proxy<GetSet>}
    */
    constructor(entries) {
        if (arguments.length < 1) {
            throw "Required 1 argument";
        }
        for (const name of Object.keys(entries)) {
            this[name] = new GetSetEntry(...[name].concat(entries[name]));
        }
        return new Proxy(this, new GetSetHandler);
    }
    /**
        @param {String} propertyName
        @param {Any} oldValue
        @param {Any} newValue
    */
    didChangeProperty() {
        // handle or delegate
    }
    /**
        @param {...String} message
    */
    throwException(...message) {
        throw new Error(message.join(" "));
    }
    /**
        @param {Array<String>} [whitelist]
    */
    resetProperties(whitelist = Object.keys(this)) {
        for (const name of whitelist) {
            this[name] = defaultValueSymbol;
        }
    }
    /**
        @param {Array<String>} [whitelist]
    */
    toJSON(whitelist) {
        if (!Array.isArray(whitelist)) {
            whitelist = Object.keys(this);
        }
        const json = {};
        for (const name of whitelist) {
            json[name] = this[name];
        }
        return json;
    }
}

export class GetSetEntry {
    /**
        @param {String} name
        @param {String} [typePattern]
        @param {Any} [defaultValue]
        @param {String} [valuePattern]
        @param {String} [description]
    */
    constructor(name, typePattern, defaultValue, valuePattern, description) {
        this.name = name;
        this.typePattern = typePattern;
        this.defaultValue = this.value = defaultValue;
        this.valuePattern = valuePattern;
        this.description = description;
    }
    /**
        @param {Any} value
    */
    acceptsTypeOf(value) {
        if (this.typePattern) {
            return typeOf(value).search(`^(${this.typePattern})$`) == 0;
        }
        return true;
    }
    /**
        @param {Any} value
    */
    accepts(value) {
        if (this.valuePattern) {
            return `${value}`.search(`^(${this.valuePattern})$`) == 0;
        }
        return true;
    }
    /**
        @param {Any} value
        @param {Function} callback
        @param {Object} [thisArg]
    */
    assign(value, callback, thisArg) {
        const oldValue = this.value;
        const newValue = this.value = value;
        if (!Object.is(oldValue, newValue)) {
            callback.call(thisArg, this.name, oldValue, newValue);
        }
    }
    /**
        @param {Function} callback
        @param {Object} [thisArg]
    */
   reset(callback, thisArg) {
        const oldValue = this.value;
        const newValue = this.value = this.defaultValue;
        if (!Object.is(oldValue, newValue)) {
            callback.call(thisArg, this.name, oldValue, newValue);
        }
    }
}

export class GetSetHandler {
    /**
        @param {GetSet} target
        @param {String} propertyName
        @param {Proxy<GetSet>} [receiver]
    */
    get(target, propertyName, receiver = target) {
        const entry = target[propertyName];

        if (entry instanceof Function) {
            return entry;
        }
        if (!(entry instanceof GetSetEntry)) {
            receiver.throwException(
                `Cannot get property "${propertyName}".`,
                "Entry was not defined"
            );
            return undefined;
        }
        return entry.value;
    }
    /**
        @param {GetSet} target
        @param {String} propertyName
        @param {Any} value
        @param {Proxy<GetSet>} [receiver]
    */
    set(target, propertyName, value, receiver = target) {
        const entry = target[propertyName];

        if (!(entry instanceof GetSetEntry)) {
            receiver.throwException(
                `Cannot set property "${propertyName}".`,
                "Entry was not defined"
            );
            return false;
        }
        if (value == defaultValueSymbol) {
            entry.reset(target.didChangeProperty, receiver);
            return true;
        }
        if (!entry.acceptsTypeOf(value)) {
            receiver.throwException(
                `Property "${entry.name}"`,
                `should be of type ${entry.typePattern}",`,
                `but got "${typeOf(value)}"`
            );
            return false;
        }
        if (!entry.accepts(value)) {
            receiver.throwException(
                `Property "${entry.name}"`,
                `should be ${entry.description || `"${entry.valuePattern}"`},`,
                `but got ${`${value}` ? `"${value}"` : "empty string"}`
            );
            return false;
        }
        entry.assign(value, target.didChangeProperty, receiver);
        return true;
    }
    /**
        @param {GetSet} target
        @param {String} propertyName
        @param {Object} descriptor
    */
    defineProperty(target, propertyName, descriptor) {
        return this.set(target, propertyName, descriptor.value);
    }
    /**
        @param {GetSet} target
        @param {String} propertyName
    */
    getOwnPropertyDescriptor(target, propertyName) {
        return {
            configurable: true,
            enumerable: true,
            value: this.get(target, propertyName)
        };
    }
}
