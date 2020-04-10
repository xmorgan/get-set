/** @module indiejs/get-set */

import {classOf} from "./utilities.js";

/**
    @ignore
*/
export class GetSetEntry {
    /**
        @param {String} name
        @param {String|Function} [typePattern]
        @param {Any} [defaultValue]
        @param {String|Function} [valuePattern]
        @param {String} [valueHint]
    */
    constructor(name, typePattern, defaultValue, valuePattern, valueHint) {
        this.name = name;

        if (typePattern instanceof Function) {
            this.acceptsTypeOf = typePattern;
        } else {
            this.typePattern = typePattern;
        }
        this.defaultValue = defaultValue;
        this.value = defaultValue;

        if (valuePattern instanceof Function) {
            this.accepts = valuePattern;
        } else {
            this.valuePattern = valuePattern;
        }
        this.valueHint = valueHint;
    }
    /**
        @param {Any} value
    */
    acceptsTypeOf(target) {
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
