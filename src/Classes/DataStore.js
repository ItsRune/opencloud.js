const { createHash } = require('crypto');
const PaginateCursor = require('../Modules/paginateCursor');
const createQuery = require('../Modules/createQuery');
const urls = require('../Utils/uris.json');

class DataStore {
    /**
     * Constructs the DataStore class.
     * @param {Universe} universe 
     */
    constructor(universe) {
        if (!universe.isUniverse && !universe.isUniverse()) throw new Error("universe must be provided");

        this._universe = universe;
        this._dataStoreName = "";
        this._dataStoreType = "standard-datastores";
        this._dataStoreScope = "global";
        this._url = urls.OPENCLOUD_STANDARD_DATSTORES + `/${this._universe._id}`;
        this._cache = {};
    };

    /**
     * Gets data from the datastore.
     * @param {String} key 
     * @param {String | undefined} scope 
     * @returns Request Data
     */
    async GetAsync(key) {
        const url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
            entryKey: key,
            scope: this._dataStoreScope,
            dataStoreName: this._dataStoreName
        });
        try {
            return await this._universe._fetch(url, 'GET');
        } catch(error) {
            throw { success: false, error: error.message };
        };
    };

    /**
     * Increments an integer value of a datastore key by the amount.
     * @param {String} key 
     * @param {Number} amount 
     * @returns { success: Boolean, error: String }
     */
    async IncrementAsync(key, amount) {
        if (!Number(amount)) throw new Error("amount must be a number");

        const url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
            entryKey: key,
            scope: this._dataStoreScope,
            dataStoreName: this._dataStoreName,
            exclusiveCreate: true,
            incrementBy: Number(amount)
        });
        try {
            const res = await this._universe._fetch(url, 'POST', {
                entryValue: amount
            });

            if (res.version) return {success: true, error: null};
            return {success: false, error: res.statusText};
        } catch(error) {
            throw { success: false, error: error.message };
        };
    };

    /**
     * Sets the data at a specific key with the new value.
     * @param {String} key 
     * @param {any} value 
     * @param {Array} userids
     * @param {{userids: Array<int64>, metadata: object}} attributes
     * @returns {{success: Boolean, error: String}}
    */
    async SetAsync(key, value, attributes) {
        let userids = [];
        let metadata = {};

        if (attributes) {
            if (attributes.userids) {
                userids = attributes.userids;
            };

            if (attributes.metadata) {
                metadata = attributes.metadata;
            };
        };
        value = JSON.stringify(value, null, 'utf8');

        // Might change 4MB datastore limit, who knows.
        const valueBufferLen = Buffer.byteLength(value);
        if (valueBufferLen > 4e+6) {
            throw new Error("New datastore entry is larger than 4MB.");
        };

        const valueMD5 = createHash('md5').update(value).digest('base64');
        const url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
            entryKey: key,
            scope: this._dataStoreScope,
            dataStoreName: this._dataStoreName,
            exclusiveCreate: true
        });
        
        try {
            const res = await this._universe._fetch(url, 'POST', {}, {
                "content-md5": valueMD5,
                "Content-Length": valueBufferLen,
                "roblox-entry-userids": JSON.stringify(userids),
                "roblox-entry-attributes": JSON.stringify(attributes)
            });

            if (res.version) return {success: true, error: null};
            return {success: false, error: res.statusText};
        } catch(error) {
            throw { success: false, error: error.message };
        };
    };

    /**
     * Gets a list of all the datastore keys.
     * @param {String | undefined} prefix
     * @param {Number | undefined} limit
     * @param {String | undefined} nextCursor
     * @returns {PaginateCursor} pages
     */
    async ListDataStoresAsync(prefix, limit) {
        if (this._cache["datastores"]) return this._cache["datastores"];

        prefix = prefix || "";
        limit = limit || 100;
        
        try {
            const url = createQuery(`${this._url}/${this._dataStoreType}`, {
                prefix, limit, cursor: ""
            });

            const pages = new PaginateCursor(url, 'GET', {
                'x-api-key': this._universe._apiKey,
                'Content-Type': 'application/json'
            });

            this._cache["datastores"] = pages;
            return pages;
        } catch(error) {
            throw { success: false, error: error.message };
        };
    };

    /**
     * Removes a key from the datastore.
     * @param {String} key 
     * @returns { success: Boolean, error: String }
     */
    async RemoveAsync(key) {
        if (typeof(key) !== "string") return new Error("key must be a string");
        const url = this._url + `/entries/entry?entryKey=${key}&scope=${this._dataStoreScope}&dataStoreName=${this._dataStoreName}`;
        try {
            const res = await this._universe._fetch(url, 'DELETE');

            console.log(res);
        } catch(error) {
            throw { success: false, error: error.message };
        };
    };

    /**
     * Changes the datastore to use when requests are made.
     * @param {String} dataStoreName 
     * @returns DataStoreService
     */
    GetDataStore(dataStoreName) {
        if (dataStoreName) {
            this._dataStoreName = dataStoreName;
        };

        // if (dataStoreType) {
        //     this._dataStoreType = dataStoreType;
        // };

        // if (dataStoreScope) {
        //     this._dataStoreScope = dataStoreScope;
        // };
        return this;
    };

    // /**
    //  * Bulk saves to a datastore. (Maybe later.)
    //  * @param {Array<{key: String, value: any, attributes: {userids: Array<int64>, metadata: Array<any>}}>} entries 
    //  */
    // async SetBulkAsync(entries) {

    // }
};

module.exports = DataStore;