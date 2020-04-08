/** @module indiejs/get-set */

/**
    Detects class name of a value.
    @function
    @param {Any} value
    @returns {String}
*/
export const classOf = (value) => {
    return ({}).toString.call(value).slice(8, -1);
};

/**
    @ignore
*/
export class GetSetEntry {
    /**
        @param {String} name
        @param {String|Function} [type]
        @param {Any} [defaultValue]
        @param {String} [valuePattern]
        @param {String} [valueHint]
    */
    constructor(name, type, defaultValue, valuePattern, valueHint) {
        this.name = name;

        if (type instanceof Function) {
            this.typeConstructor = type;
        } else {
            this.typePattern = type;
        }
        this.defaultValue = defaultValue;
        this.value = defaultValue;
        this.valuePattern = valuePattern;
        this.valueHint = valueHint;
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
        @param {Any} [context]
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
        @param {Any} [context]
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
