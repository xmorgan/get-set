import {GetSetEntry} from "./get-set-entry.js";
/**
    The traps for Proxy<GetSet>
    @private
    @param {Object} [init]
    @param {Boolean} [init.seal]
*/
export class GetSetHandler {
    constructor({seal = false} = {}) {
        this.seal = seal;
    }
    /**
        The trap for getting property values.
        @param {GetSet} target
        @param {String|Symbol} property
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
            : !this.seal && Reflect.set(target, property, value);
    }
    /**
        The trap for Object.getOwnPropertyDescriptor()
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
    /**
        The trap for Object.defineProperty()
    */
    defineProperty() {
        return false;
    }
    /**
        The trap for the delete operator.
    */
    deleteProperty() {
        return false;
    }
}
