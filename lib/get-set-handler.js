import {GetSetEntry} from "./get-set-entry.js";
import {readOnly, defaultValue} from "./utilities.js";

/**
    Creates traps for Proxy<GetSet>.
    @param {Object<String, Boolean>} [flags] - A trap enabling flags.
    @private
*/
export class GetSetHandler {
    constructor({
        defineProperty = false
    } = {}) {
        this.flags = {
            defineProperty
        };
    }
    /**
        A trap for getting property values.
        @param {GetSet} target
        @param {String} property
    */
    get(target, property) {
        const entry = target[property];

        if (entry instanceof GetSetEntry) {
            return entry.value;
        }
        return entry;
    }
    /**
        A trap for setting property values.
        @param {GetSet} target
        @param {String} property
        @param {Any} value
        @param {Proxy<GetSet>} receiver
    */
    set(target, property, value, receiver) {
        const entry = target[property];

        if (!(entry instanceof GetSetEntry)) {
            throw receiver.willThrow(new SetError(
                property,
                "It was not described"
            ));
        }
        if (readOnly == entry.matchesTypeOf) {
            throw receiver.willThrow(new SetError(
                property,
                "It is read-only"
            ));
        }
        if (defaultValue == value) {
            entry.update(entry.defaultValue);
            return true;
        }
        if (!entry.matchesTypeOf(value)) {
            throw receiver.willThrow(new SetError(
                property,
                `It does not match type ${entry.type || "pattern"}`
            ));
        }
        if (!entry.matches(value)) {
            throw receiver.willThrow(new SetError(
                property,
                `It does not match ${entry.hint || entry.pattern || "pattern"}`
            ));
        }
        entry.update(value);
        return true;
    }
    /**
        A trap for Object.defineProperty()
    */
    defineProperty() {
        if (this.flags.defineProperty) {
            return Reflect.defineProperty(...arguments);
        }
        return false;
    }
    /**
        A trap for Object.getOwnPropertyDescriptor()
        @param {GetSet} target
        @param {String} property
    */
    getOwnPropertyDescriptor(target, property) {
        return {
            configurable: true,
            enumerable: true,
            value: this.get(target, property)
        };
    }
}

/**
    @param {String} name -  A property name.
    @param {String} details - An error details.
*/
class SetError extends Error {
    constructor(name, details) {
        super(
            `Cannot set property '${name}'. ${details}`
        );
    }
}
