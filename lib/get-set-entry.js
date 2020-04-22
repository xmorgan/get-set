import {GetSet} from "./get-set.js";
/**
    Detects class name of a value.
    @param {*} value
*/
export const classOf = (value) => ({}).toString.call(value).slice(8, -1);
/**
    Represents read-only property.
*/
export const readOnly = () => false;
/**
    Represents default value.
*/
export const defaultValue = Symbol("defaultValue");
/**
    Used to get entry owner.
*/
const entryOwnerMap = new WeakMap;
/**
    Used to get owner entry.
*/
const ownerEntryMap = new WeakMap;
/**
    Controls entry updates.
    @private
    @param {Object} init
    @param {String} [init.name] - An entry name.
    @param {String|Function} [init.type] - A type pattern.
    @param {RegExp|Function} [init.pattern] - A value pattern.
    @param {String} [init.hint] - A value hint.
    @param {*} [init.value] - A default value.
    @param {Proxy<GetSet>} owner - An entry owner.
*/
export class GetSetEntry {
    constructor({name, type, pattern, hint, value}, owner) {
        this.name = name;

        switch (classOf(type)) {
        case "Undefined":
        case "String":
            this.type = type;
            break;
        case "Function":
            this.matchesTypeOf = type;
            break;
        default:
            this.throw(
                "Cannot define 'type',",
                `using ${type} (${classOf(type)})`
            );
        }
        switch (classOf(pattern)) {
        case "Undefined":
        case "RegExp":
            this.pattern = pattern;
            break;
        case "Function":
            this.matches = pattern;
            break;
        default:
            this.throw(
                "Cannot define 'pattern',",
                `using ${pattern} (${classOf(pattern)})`
            );
        }
        this.hint = hint;
        this.value = this.defaultValue = value;
        this.isNode = (value instanceof GetSet);

        if (this.isNode) {
            ownerEntryMap.set(value, this);
        }
        entryOwnerMap.set(this, owner);
    }
    /**
        Throws an error.
        @param {...String} message
    */
    throw(...message) {
        throw new Error(`Entry '${this.name}': ${message.join(" ")}`);
    }
    /**
        Tests whether type pattern matches value type.
        @returns {Boolean}
    */
    matchesTypeOf(value) {
        return this.type
            ? classOf(value).search(`^(${this.type})$`) == 0
            : true;
    }
    /**
        Tests whether value pattern matches value.
        @returns {Boolean}
    */
    matches(value) {
        return this.pattern
            ? this.pattern.test(value)
            : true;
    }
    /**
        Updates value.
        @param {*} value
    */
    update(value) {
        if (this.isNode) {
            Object.assign(this.value, value);
            return;
        }
        if (readOnly == this.matchesTypeOf) {
            this.throw("Read-only");
        }
        if (defaultValue == value) {
            value = this.defaultValue;
        }
        if (!this.matchesTypeOf(value)) {
            this.throw(
                `The type pattern${this.type ? ` (${this.type})` : ""}`,
                `does not match value type (${classOf(value)})`
            );
        }
        if (!this.matches(value)) {
            this.throw(
                `The${` ${this.hint || this.pattern || "custom"} `}pattern`,
                `does not match value ${value}`
            );
        }
        const oldValue = this.value;
        const newValue = this.value = value;

        if (!Object.is(oldValue, newValue)) {
            this.notify(this.name, oldValue, newValue);
        }
    }
    /**
        Notifies owner that value has changed.
        @param {String} name - An entry name.
        @param {*} oldValue - An old value.
        @param {*} newValue - A new value.
    */
    notify(name, oldValue, newValue) {
        const owner = entryOwnerMap.get(this);
        owner.didChangeProperty({name, oldValue, newValue});

        const entry = ownerEntryMap.get(owner);
        if (entry) {
            entry.notify(`${entry.name}.${name}`, oldValue, newValue);
        }
    }
}
