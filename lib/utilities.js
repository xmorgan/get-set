/**
    Detects class name of a value.
    @param {*} value - An object or primitive.
    @example
    classOf(new Number); // "Number"
    classOf(0); // "Number"
*/
export const classOf = (value) => {
    return ({}).toString.call(value).slice(8, -1);
};

/**
    A symbol for definition of read only properties.
    @example new GetSet({ id: [readOnly, 1] })
*/
export const readOnly = () => false;

/**
    A symbol for property reset.
    @type {Symbol}
*/
export const defaultValue = Symbol("defaultValue");

