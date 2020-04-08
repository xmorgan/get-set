/** @module indiejs/get-set */

import {GetSetEntry, classOf} from "./get-set-entry.js";

/**
    Used to reset property to default value.
    @type {Symbol}
*/
export const defaultValueSymbol = Symbol("defaultValue");

/**
    @ignore
*/
export class GetSetHandler {
    /**
        @param {GetSet} target
        @param {String} propertyName
        @param {Proxy<GetSet>} [receiver]
    */
    get(target, propertyName, receiver = target) {
        const entry = target[propertyName];

        if (entry instanceof Function) {
            return entry;
        }
        if (!(entry instanceof GetSetEntry)) {
            receiver.throwException(
                `Cannot get property '${propertyName}'.`,
                "Entry was not defined"
            );
            return undefined;
        }
        return entry.value;
    }
    /**
        @param {GetSet} target
        @param {String} propertyName
        @param {Any} value
        @param {Proxy<GetSet>} [receiver]
    */
    set(target, propertyName, value, receiver = target) {
        const entry = target[propertyName];

        if (!(entry instanceof GetSetEntry)) {
            receiver.throwException(
                `Cannot set property '${propertyName}'.`,
                "Entry was not defined"
            );
            return false;
        }
        if (value == defaultValueSymbol) {
            entry.reset(target.didChangeProperty, receiver);
            return true;
        }
        if (!entry.acceptsTypeOf(value)) {
            receiver.throwException(
                `Property '${entry.name}' should be of type`,
                `'${entry.typePattern || entry.typeConstructor.name}',`,
                `but got '${classOf(value)}'`
            );
            return false;
        }
        if (!entry.accepts(value)) {
            receiver.throwException(
                `Property '${entry.name}'`,
                `should be ${entry.valueHint || `'${entry.valuePattern}'`},`,
                `but got ${`${value}` ? `'${value}'` : "empty string"}`
            );
            return false;
        }
        entry.assign(value, target.didChangeProperty, receiver);
        return true;
    }
    /**
        @param {GetSet} target
        @param {String} propertyName
        @param {Object} descriptor
    */
    defineProperty(target, propertyName, descriptor) {
        return this.set(target, propertyName, descriptor.value);
    }
    /**
        @param {GetSet} target
        @param {String} propertyName
    */
    getOwnPropertyDescriptor(target, propertyName) {
        return {
            configurable: true,
            enumerable: true,
            value: this.get(target, propertyName)
        };
    }
}
