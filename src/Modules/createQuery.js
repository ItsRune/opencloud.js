/**
 * Creates the query used for requesting to urls.
 * @param {String} url 
 * @param {Object} params 
 * @returns {string}
 */
module.exports = function(url, params) {
    if (!params) return url;
    const query = Object.keys(params).map((key) => {
        if (params[key] !== undefined) return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
    }).join('').slice(0, -1);
    return `${url}?${query}`;
};