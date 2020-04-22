/**
    Detects class name of a value.
    @param {*} value
*/
export const classOf = (value) => {
    return ({}).toString.call(value).slice(8, -1);
};

/**
    Represents read-only property.
*/
export const readOnly = () => false;

/**
    Represents default value.
*/
export const defaultValue = Symbol("defaultValue");
