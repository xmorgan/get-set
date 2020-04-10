/**
    Used to reset property to default value.
    @type {Symbol}
*/
export const defaultValueSymbol = Symbol("defaultValue");

/**
    Detects class name of a value.
    @function
    @param {Any} value
    @returns {String}
*/
export const classOf = (value) => {
    return ({}).toString.call(value).slice(8, -1);
};

/**
    Can be used to describe a constant.
    @example new GetSet({ id: [constant, 0] })
    @function
*/
export const constant = () => false;

/**
    Can be used to describe a custom type.
    @example new GetSet({ id: type(CustomThing) })
    @function
    @param {...Function} constructor
    @returns {Function}
*/
export const type = (...constructor) => {
    return (value) => {
        if (value == null) {
            for (const one of constructor) {
                if (Object.is(one, value)) {
                    return true;
                }
            }
            return false;
        }
        value = Object(value);
        for (const one of constructor) {
            if (value instanceof one) {
                return true;
            }
        }
        return false;
    };
};

