import {GetSet} from "./get-set.js";
import {GetSetEntry} from "./get-set-entry.js";
import {readOnly, defaultValue} from "./utilities.js";

/**
    Creates traps for Proxy<GetSet>.
    @private
*/
export class GetSetHandler {
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
        const cannotSetProperty = `Cannot set property '${property}'.`;

        if (!(entry instanceof GetSetEntry)) {
            receiver.throwException(
                cannotSetProperty,
                "It was not described"
            );
            return false;
        }
        if (entry.matchesTypeOf == readOnly) {
            receiver.throwException(
                cannotSetProperty,
                "It is read-only"
            );
            return false;
        }
        if (value == defaultValue) {
            entry.update(
                entry.defaultValue,
                target.didChangeProperty,
                receiver
            );
            return true;
        }
        if (!entry.matchesTypeOf(value)) {
            receiver.throwException(
                cannotSetProperty,
                `It does not match type ${entry.type || "pattern"}`
            );
            return false;
        }
        if (!entry.matches(value)) {
            receiver.throwException(
                cannotSetProperty,
                `It does not match ${entry.hint || entry.pattern || "pattern"}`
            );
            return false;
        }
        entry.update(
            value,
            target.didChangeProperty,
            receiver
        );
        return true;
    }
    /**
        A trap for Object.defineProperty()
        @param {GetSet} target
        @param {String} property
        @param {Object} descriptor
    */
    defineProperty(target, property, descriptor) {
        const name = property;
        const {value} = descriptor;

        if (target[name]) {
            throw new Error(`Cannot override property '${name}'`);
        }
        if (value instanceof GetSet) {
            target[name] = new GetSetEntry({name, type: readOnly, value});
        } else {
            target[name] = new GetSetEntry({...value, name});
        }
        return true;
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
