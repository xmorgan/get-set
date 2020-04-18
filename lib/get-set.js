import {GetSetHandler} from "./get-set-handler.js";
import {GetSetEntry} from "./get-set-entry.js";
import {readOnly, defaultValue} from "./utilities.js";

/**
    Creates typed and observable object.
    @param {Object<String, Object>} descriptors - A property descriptors.
    @param {Object<String, Boolean>} [flags]
    @returns {Proxy<GetSet>}
*/
export class GetSet {
    constructor(descriptors, flags) {
        const self = new Proxy(this, new GetSetHandler(flags));

        if (arguments.length < 1) {
            throw self.willThrow(new Error("Required 1 argument"));
        }
        for (const [name, value] of Object.entries(descriptors)) {
            if (value instanceof GetSet) {
                this[name] = new GetSetEntry({type: readOnly, value, name}, self);
            } else {
                this[name] = new GetSetEntry({...value, name}, self);
            }
        }
        return self;
    }
    /**
        Resets one or more properties to default values.
        @param {Array<String>} [whitelist] - A properties to reset.
    */
    toDefaults(whitelist) {
        if (!Array.isArray(whitelist)) {
            whitelist = Object.keys(this);
        }
        for (const name of whitelist) {
            if (this[name] instanceof GetSet) {
                this[name].toDefaults();
            } else {
                this[name] = defaultValue;
            }
        }
        return this;
    }
    /**
        Creates a plain object.
        @param {Array<String>} [whitelist] - A properties to include.
    */
    toJSON(whitelist) {
        const map = {};

        if (!Array.isArray(whitelist)) {
            whitelist = Object.keys(this);
        }
        for (const name of whitelist) {
            const value = this[name];
            map[name] = (value instanceof GetSet) ? value.toJSON() : value;
        }
        return map;
    }
    /**
        Called right before an exception is thrown.
        @abstract
        @param {Error} exception
    */
    willThrow(exception) {
        return exception;
    }
    /**
        Called when a property value has changed.
        @abstract
        @param {Object} info
        @param {String} info.name - A property name.
        @param {Any} info.oldValue - An old value.
        @param {Any} info.newValue - A new value.
    */
    didChangeProperty() {}
}
