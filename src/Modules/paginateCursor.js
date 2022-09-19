const fetch = require('node-fetch');

class PaginateCursor {
    constructor(url, method, headers, body) {
        this._url = url;
        this._method = method;
        this._headers = headers;
        this._body = (method !== "GET" && method !== "HEAD") ? JSON.stringify(body) || "" : undefined;
        this._data = [];
        this._page = 0;
        this._nextPageCursor = null;
        this._prevPageCursor = null;

        this.#GetData().then(() => {
            this.GetNextPage = () => {
                this._page++;
                return this._data[this._page];
            };

            this.GetPreviousPage = () => {
                this._page--;
                return this._data[this._page];
            };
        }).catch(err => { throw new Error(err); });
    };

    async #GetData() {
        while (this._nextPageCursor !== null) {
            try {
                const url = (this._prevPageCursor !== null && this._nextPageCursor !== null) ? this._url + `?cursor=${this._nextPageCursor}` : this._url;
                const res = await fetch(url, {
                    method: this._method,
                    headers: this._headers,
                    body: this._body
                });
    
                if (res.status === 200) {
                    const data = await res.json();

                    this._data.push([...data.data]);
    
                    if (data.nextPageCursor === null) {
                        this._nextPageCursor = null;
                        break;
                    };
                };

                this._prevPageCursor = this._nextPageCursor;
                this._nextPageCursor = data.nextPageCursor;
            } catch(error) {
                throw error;
            };
        };

        return this._data;
    };
};

module.exports = PaginateCursor;