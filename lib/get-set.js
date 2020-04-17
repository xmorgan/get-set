import {GetSetEntry} from "./get-set-entry.js";
import {GetSetHandler} from "./get-set-handler.js";
import {defaultValue} from "./utilities.js";

/**
    Creates typed and observable object.
    @param {Object} entries - A property descriptors.
    @returns {Proxy<GetSet>}
*/
export class GetSet {
    constructor(entries) {
        if (arguments.length < 1) {
            return this.throwException("Required 1 argument");
        }
        for (const name of Object.keys(entries)) {
            const [type, value, pattern, hint] = [].concat(entries[name]);
            this[name] = new GetSetEntry({name, type, value, pattern, hint});
        }
        return new Proxy(this, new GetSetHandler);
    }
    /**
        Called when a property value did change.
        @abstract
        @param {String} name - A property name.
        @param {Any} oldValue - An old value.
        @param {Any} newValue - A new value.
    */
    didChangeProperty() {
        // handle or delegate
    }
    /**
        Throws an exception.
        @param {...String} message - An exception message.
    */
    throwException(...message) {
        throw new Error(message.join(" "));
    }
    /**
        Resets one or more properties to default values.
        @param {Array<String>} [whitelist] - A properties to reset.
    */
    resetProperties(whitelist) {
        if (!Array.isArray(whitelist)) {
            whitelist = Object.keys(this);
        }
        for (const name of whitelist) {
            this[name] = defaultValue;
        }
    }
    /**
        Creates a plain object.
        @param {Array<String>} [whitelist] - A properties to include.
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
