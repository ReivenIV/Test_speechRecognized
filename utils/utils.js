export const isString = (str) => typeof str === "string";
export const isStringEmpty = (str) => isString(str) && str.length > 0;
export const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

