/**
    @module indiejs/get-set
*/

/**
    Detects class name of a value.
    @private
    @function
    @param {Any} value A value.
    @returns {String} A class name.
*/
export const classOf = (value) => {
    return ({}).toString.call(value).slice(8, -1);
};

/**
    Used to reset property to default value.
    @type {Symbol}
*/
export const defaultValueSymbol = Symbol("defaultValue");

export class GetSet {
    /**
        @param {Object} entries A property type/value descriptors.
        @returns {Proxy<GetSet>}
        @example new GetSet({ id: Number });
        @example new GetSet({ id: "Number|Null" });
        @example new GetSet({ id: [Number, 0] });
        @example new GetSet({ id: [Number, 0, "[0-9]+"] });
        @example new GetSet({ id: [Number, 0, "[0-9]+", "a positive integer"] });
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
        Called when a property value did change.
        @abstract
        @param {String} name A property name.
        @param {Any} oldValue An old value.
        @param {Any} newValue A new value.
    */
    didChangeProperty() {
        // handle or delegate
    }
    /**
        Throws an exception.
        @param {...String} message An exception message.
    */
    throwException(...message) {
        throw new Error(message.join(" "));
    }
    /**
        Resets multiple properties to default values.
        @param {Array<String>} [whitelist] A list of properties to reset.
    */
    resetProperties(whitelist = Object.keys(this)) {
        for (const name of whitelist) {
            this[name] = defaultValueSymbol;
        }
    }
    /**
        Creates a plain object.
        @param {Array<String>} [whitelist] A list of properties to include.
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

/**
    @private
*/
export class GetSetEntry {
    /**
        @param {String} name
        @param {String|Function} [type]
        @param {Any} [defaultValue]
        @param {String} [valuePattern]
        @param {String} [description]
    */
    constructor(name, type, defaultValue, valuePattern, description) {
        this.name = name;

        if (type instanceof Function) {
            this.typeConstructor = type;
        } else {
            this.typePattern = type;
        }
        this.defaultValue = defaultValue;
        this.value = defaultValue;
        this.valuePattern = valuePattern;
        this.description = description;
    }
    /**
        @param {Any} value
    */
    acceptsTypeOf(target) {
        if (this.typeConstructor) {
            return Object(target) instanceof this.typeConstructor;
        }
        if (this.typePattern) {
            return classOf(target).search(`^(${this.typePattern})$`) == 0;
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
        @param {Object} [context]
    */
    assign(value, callback, context) {
        const oldValue = this.value;
        const newValue = this.value = value;
        if (!Object.is(oldValue, newValue)) {
            callback.call(context, this.name, oldValue, newValue);
        }
        return this;
    }
    /**
        @param {Function} callback
        @param {Object} [context]
    */
   reset(callback, context) {
        const oldValue = this.value;
        const newValue = this.value = this.defaultValue;
        if (!Object.is(oldValue, newValue)) {
            callback.call(context, this.name, oldValue, newValue);
        }
        return this;
    }
}

/**
    @private
*/
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
                `Cannot get property '${propertyName}'.`,
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
                `Cannot set property '${propertyName}'.`,
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
                `Property '${entry.name}' should be of type`,
                `'${entry.typePattern || entry.typeConstructor.name}',`,
                `but got '${classOf(value)}'`
            );
            return false;
        }
        if (!entry.accepts(value)) {
            receiver.throwException(
                `Property '${entry.name}'`,
                `should be ${entry.description || `'${entry.valuePattern}'`},`,
                `but got ${`${value}` ? `'${value}'` : "empty string"}`
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
