import {GetSetHandler} from "./get-set-handler.js";
import {GetSetEntry, defaultValue} from "./get-set-entry.js";
/**
    Returns new GetSet class, that extends base class.
    @memberof GetSet
    @alias extends
    @function
    @param {Function} Base - A class to extend, e.g. Object.
    @returns {Function}
*/
const createGetSet = (Base) => {
    /**
        Creates typed and observable object.
        @class
        @param {Object<String, Object>} schema - A map of {type, pattern, hint, value}
        @returns {Proxy<GetSet>}
    */
    return class GetSet extends Base {
        constructor(schema, ...rest) {
            super(...rest);
            const self = new Proxy(this, new GetSetHandler);

            if (arguments.length < 1) {
                throw new Error("Required at least 1 argument");
            }
            for (const [name, value] of Object.entries(schema)) {
                this[name] = new GetSetEntry(
                    (value instanceof GetSet) ? {name, value} : {...value, name},
                    self
                );
            }
            return self;
        }
        /**
            Resets properties to default values.
            @memberof GetSet#
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
            Serializes GetSet to JSON.
            @memberof GetSet#
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
            Called when a property value has been changed.
            @memberof GetSet#
            @param {String} name - A property name path.
            @param {*} oldValue - An old value.
            @param {*} newValue - A new value.
        */
        handlePropertyChange() {}
        /**
            Called when a property value has been rejected.
            @memberof GetSet#
            @param {String} name - A property name path.
            @param {Error} reason - A rejection reason.
        */
        handlePropertyReject(name, reason) {
            console.error(reason);
        }
        /*
            Public reference to createGetSet.
        */
        static extends() {
            return createGetSet(...arguments);
        }
    };
};

export const GetSet = createGetSet(Object);
