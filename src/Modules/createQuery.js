module.exports = function(url, params) {
    const query = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    return `${url}?${query}`;
};