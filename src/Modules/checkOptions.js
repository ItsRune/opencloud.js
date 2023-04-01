const options = require('../Utils/options.json');

/**
 * Checks to make sure all values of the options do exist and adds if they don't.
 * @param {options} definedOptions 
 * @returns {options} newOptions
 */
module.exports = function(definedOptions) {
    const entries = Object.entries(options);
    definedOptions = (typeof(definedOptions) === "object") ? definedOptions : {};

    for (const [key, value] of entries) {
        if (!definedOptions[key]) definedOptions[key] = value[1];
        else if (typeof definedOptions[key] !== typeof value[1]) definedOptions[key] = value[1];
    };

    return definedOptions;
}