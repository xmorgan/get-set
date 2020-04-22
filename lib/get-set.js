import {GetSetHandler} from "./get-set-handler.js";
import {GetSetEntry, defaultValue} from "./get-set-entry.js";
/**
    Creates typed and observable object.
    @param {Object<String, Object>} descriptors - A property descriptors.
    @returns {Proxy<GetSet>}
*/
export class GetSet {
    constructor(descriptors) {
        const self = new Proxy(this, new GetSetHandler);

        if (arguments.length < 1) {
            throw new Error("Required 1 argument");
        }
        for (const [name, value] of Object.entries(descriptors)) {
            this[name] = new GetSetEntry(
                (value instanceof GetSet) ? {name, value} : {...value, name},
                self
            );
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
        Serializes to JSON object.
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
        Called when a property value has changed.
        @param {Object} info
        @param {String} info.name - A property name.
        @param {Any} info.oldValue - An old value.
        @param {Any} info.newValue - A new value.
    */
    didChangeProperty() {}
}
