import {GetSetEntry} from "./get-set-entry.js";
/**
    The traps for Proxy<GetSet>
    @private
*/
export class GetSetHandler {
    /**
        The trap for getting property values.
        @param {GetSet} target
        @param {String|Symbol} property
        @returns {*}
    */
    get(target, property) {
        const entry = target[property];
        return (entry instanceof GetSetEntry)
            ? entry.value
            : entry;
    }
    /**
        The trap for setting property values.
        @param {GetSet} target
        @param {String|Symbol} property
        @param {*} value
    */
    set(target, property, value) {
        const entry = target[property];
        return (entry instanceof GetSetEntry)
            ? !entry.update(value)
            : Reflect.set(target, property, value);
    }
    /**
        The trap for Object.getOwnPropertyDescriptor()
        @param {GetSet} target
        @param {String|Symbol} property
        @returns {Object}
    */
    getOwnPropertyDescriptor(target, property) {
        return (target[property] instanceof GetSetEntry)
            ? {
                configurable: true,
                enumerable: true,
                value: this.get(target, property)
            }
            : Reflect.getOwnPropertyDescriptor(target, property);
    }
}
