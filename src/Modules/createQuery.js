module.exports = function(url, params) {
    const query = Object.keys(params).map((key) => {
        if (params[key] !== undefined) return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
    }).join('').slice(0, -1);
    return `${url}?${query}`;
};