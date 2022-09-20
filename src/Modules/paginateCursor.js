const fetch = require('node-fetch');

class PaginateCursor {
    constructor(url, method, headers, body, dataName = "datastores") {
        this._url = url;
        this._method = method;
        this._headers = headers;
        this._body = (method !== "GET" && method !== "HEAD") ? JSON.stringify(body) || "" : undefined;
        this._nextPageCursor = "";
        this._cursorCache = [];
        this._cursorIndex = 0;
        this._dataName = dataName;
    };

    /**
     * Returns the data from the next page and caches the cursor.
     * @returns {Promise<Array>} Next Page
     */
    async GetNextPageAsync() {
        try {
            const url = (this._cursorIndex === 0) ? this._url : this._url + `?cursor=${this._nextPageCursor}`;
            const data = await fetch(url, {
                method: this._method,
                headers: this._headers,
                body: this._body
            });
            const json = await data.json();
            
            if (json.nextPageCursor !== '') {
                this._cursorCache.push(json.nextPageCursor);
                this._cursorIndex++;
            };
            
            return json[this._dataName];
        } catch(error) {
            throw error;
        }
    };

    /**
     * Returns the data from the previous page.
     * @returns {Promise<Array>} Previous Page
     */
    async GetPreviousPageAsync() {
        try {
            this._cursorIndex--;
            this._nextPageCursor = this._cursorCache[this._cursorIndex] || null;
            
            const url = (this._cursorIndex === 0) ? this._url : this._url + `?cursor=${this._nextPageCursor}`;
            const data = await fetch(url, {
                method: this._method,
                headers: this._headers,
                body: this._body
            });
            
            const json = await data.json();
            return json[this._dataName];
        } catch(error) {
            throw error;
        };
    };
};

module.exports = PaginateCursor;