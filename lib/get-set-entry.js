import {classOf} from "./utilities.js";

/**
    Controls entry validation and updates.
    @private
    @param {Object} init
    @param {String} [init.name] - An entry name.
    @param {String|Function} [init.type] - A type pattern or a function.
    @param {*} [init.value] - A default value.
    @param {RegExp|Function} [init.pattern] - A value pattern or a function.
    @param {String} [init.hint] - A value hint.
*/
export class GetSetEntry {
    constructor({name, type, value, pattern, hint}) {
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
            throw new DefinitionError("type", type);
        }
        this.value = this.defaultValue = value;

        switch (classOf(pattern)) {
        case "Undefined":
        case "RegExp":
            this.pattern = pattern;
            break;
        case "Function":
            this.matches = pattern;
            break;
        default:
            throw new DefinitionError("pattern", pattern);
        }
        this.hint = hint;
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
        @param {Function} callback - Called if a change has occurred.
        @param {*} [context] - A callback context.
        @returns {GetSetEntry}
    */
    update(value, callback, context) {
        const oldValue = this.value;
        const newValue = this.value = value;

        if (!Object.is(newValue, oldValue)) {
            callback.apply(context, [this.name, newValue, oldValue]);
        }
        return this;
    }
}

/**
    @param {String} name - A property name.
    @param {*} value - An invalid value.
*/
export class DefinitionError extends Error {
    constructor(name, value) {
        super(
            `Cannot define '${name}', using ${value} (${classOf(value)})`
        );
    }
}
