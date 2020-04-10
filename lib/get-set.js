/** @module indiejs/get-set */

import {GetSetEntry} from "./get-set-entry.js";
import {GetSetHandler, defaultValueSymbol} from "./get-set-handler.js";

/**
    @example new GetSet({ id: Number });
    @example new GetSet({ id: "Number|Null" });
    @example new GetSet({ id: [Number, 0] });
    @example new GetSet({ id: [Number, 0, "[0-9]+"] });
    @example new GetSet({ id: [Number, 0, "[0-9]+", "a positive integer"] });
*/
export class GetSet {
    /**
        @param {Object} entries A property type/value descriptors.
        @returns {Proxy<GetSet>}
    */
    constructor(entries) {
        if (arguments.length < 1) {
            return this.throwException("Required 1 argument");
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
