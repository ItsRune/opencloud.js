const packages = require('../Utils/packages.json');

const axios = require(packages.fetch);

class PaginateCursor {
    constructor(url, method, headers, body, dataName = "datastores") {
        this._url = url;
        this._method = method;
        this._headers = headers;
        this._body = (method !== "GET" && method !== "HEAD") ? JSON.stringify(body) || "" : undefined;
        this._nextPageCursor = "";
        this._cursorCache = [null];
        this._cursorIndex = 0;
        this._dataName = dataName;
        this.content = [];
    };

    /**
     * Returns the data from the next page and caches the cursor.
     * @returns {Promise<Array>} Next Page
     */
    async GetNextPageAsync() {
        if (this._nextPageCursor === null) return null;
        try {
            const url = (this._cursorIndex === 0) ? this._url : this._url + `?cursor=${this._nextPageCursor}`;
            const res = await axios(url, {
                method: this._method,
                headers: this._headers,
                body: this._body
            });
            const json = res.data;

            if (json.nextPageCursor !== '' && json.nextPageCursor !== null) {
                this._cursorCache.push(json.nextPageCursor);
                this._cursorIndex++;

                this.content = json[this._dataName];
                return json[this._dataName];
            };

            this._nextPageCursor = null;
            this.content = json[this._dataName];
            return json[this._dataName];
        } catch(error) {
            throw error;
        }
    };

    /**
     * Returns the data from the current page.
     * @returns {Promise<Array>} Current Page
     */
    async GetCurrentPageAsync() {
        try {
            if (this.content.length > 0) return this.content;
            const url = (this._cursorIndex === 0) ? this._url : this._url + `?cursor=${this._nextPageCursor}`;
            const res = await axios(url, {
                method: this._method,
                headers: this._headers,
                body: this._body
            });
            const json = res.data;

            this.content = json[this._dataName];
            return json[this._dataName];
        } catch(error) {
            throw error;
        };
    }

    /**
     * Returns the data from the previous page.
     * @returns {Promise<Array>} Previous Page
     */
    async GetPreviousPageAsync() {
        if (this._cursorIndex === 0) return null;
        try {
            this._cursorIndex--;
            this._nextPageCursor = this._cursorCache[this._cursorIndex] || null;
            
            const url = (this._cursorIndex === 0) ? this._url : this._url + `?cursor=${this._nextPageCursor}`;
            const res = await axios(url, {
                method: this._method,
                headers: this._headers,
                body: this._body
            });
            const json = res.data;

            this.content = json[this._dataName];
            return json[this._dataName];
        } catch(error) {
            throw error;
        };
    };
};

module.exports = PaginateCursor;