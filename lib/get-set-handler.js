/** @module indiejs/get-set */

import {GetSetEntry} from "./get-set-entry.js";
import {defaultValueSymbol, constant, classOf} from "./utilities.js";

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
                "It was not described"
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
                "It was not described"
            );
            return false;
        }
        if (value == defaultValueSymbol) {
            entry.reset(target.didChangeProperty, receiver);
            return true;
        }
        if (entry.acceptsTypeOf == constant) {
            receiver.throwException(
                `Property '${propertyName}' is constant`
            );
            return false;
        }
        if (!entry.acceptsTypeOf(value)) {
            entry.typePattern ?
                receiver.throwException(
                    `Property '${propertyName}'`,
                    `should be of type '${entry.typePattern}',`,
                    `but got '${classOf(value)}'`
                ) :
                receiver.throwException(
                    `Property '${propertyName}'`,
                    `does not accept type of value '${value}'`
                );
            return false;
        }
        if (!entry.accepts(value)) {
            entry.valuePattern ?
                receiver.throwException(
                    `Property '${propertyName}'`,
                    `should be ${entry.valueHint || `'${entry.valuePattern}'`},`,
                    `but got ${`${value}` ? `'${value}'` : "empty string"}`
                ) :
                receiver.throwException(
                    `Property '${propertyName}'`,
                    `does not accept value '${value}'`
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
