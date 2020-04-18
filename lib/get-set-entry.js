import {GetSet} from "./get-set.js";
import {classOf} from "./utilities.js";

const entryOwnerMap = new WeakMap;
const ownerEntryMap = new WeakMap;

/**
    Controls entry validation and updates.
    @private
    @param {Object} init
    @param {String} [init.name] - An entry name.
    @param {String|Function} [init.type] - A type pattern or a function.
    @param {RegExp|Function} [init.pattern] - A value pattern or a function.
    @param {String} [init.hint] - A pattern hint.
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
            throw owner.willThrow(new ConstructError("type", type));
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
            throw owner.willThrow(new ConstructError("pattern", pattern));
        }
        this.hint = hint;
        this.value = this.defaultValue = value;

        if (value instanceof GetSet) {
            ownerEntryMap.set(value, this);
        }
        entryOwnerMap.set(this, owner);
    }
    /**
        Tests whether type of value matches type pattern.
    */
    matchesTypeOf(value) {
        if (this.type) {
            return classOf(value).search(`^(${this.type})$`) == 0;
        }
        return true;
    }
    /**
        Tests whether value matches pattern.
    */
    matches(value) {
        if (this.pattern) {
            return this.pattern.test(value);
        }
        return true;
    }
    /**
        Updates value.
        @param {*} value - A new value.
    */
    update(value) {
        const {name, value: oldValue} = this;
        const newValue = this.value = value;

        if (!Object.is(oldValue, newValue)) {
            let owner = entryOwnerMap.get(this);
            owner.didChangeProperty({name, oldValue, newValue});
            // FIXME: Looks like a mess..
            let path = name;
            let entry;
            while (entry = ownerEntryMap.get(owner)) {
                owner = entryOwnerMap.get(entry);
                path = `${entry.name}.${path}`;
                owner.didChangeProperty({name: path, oldValue, newValue});
            }
        }
        return this;
    }
}

/**
    @param {String} name - A property name.
    @param {*} value - An invalid value.
*/
class ConstructError extends Error {
    constructor(name, value) {
        super(
            `Cannot define '${name}', using ${value} (${classOf(value)})`
        );
    }
}
