const packages = require('../Utils/packages.json');

const { createHash } = require(packages.crypto);
const PaginateCursor = require('../Modules/paginateCursor');
const createQuery = require('../Modules/createQuery');
const urls = require('../Utils/uris.json');

class DataStore {
    /**
     * Constructs the DataStore class.
     * @param {Universe} universe 
     */
    constructor(universe, _dataStoreName = "") {
        if (!universe.isUniverse && !universe.isUniverse()) throw new Error("universe must be provided");

        this._universe = universe;
        this._dataStoreName = _dataStoreName;
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
            incrementBy: Number(amount)
        });
        try {
            return await this._universe._fetch(url, 'POST', {
                entryValue: amount
            });
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
        const valueJSON = JSON.stringify(value);

        // Might change 4MB datastore limit, who knows.
        const valueBufferLen = Buffer.byteLength(valueJSON);
        if (valueBufferLen > 4e+6) {
            throw new Error("New datastore entry is larger than 4MB.");
        };

        const valueMD5 = createHash("md5").update(valueJSON);
        const checkSum = valueMD5.digest("base64");
        const url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
            entryKey: key,
            scope: this._dataStoreScope,
            dataStoreName: this._dataStoreName
        });
        
        try {
            return await this._universe._fetch(url, "post", value, {
                "Content-MD5": checkSum,
                "roblox-entry-userids": JSON.stringify(userids),
                "roblox-entry-attributes": (metadata) ? JSON.stringify(metadata) : ""
            });
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

        prefix = prefix || undefined;
        limit = limit || 100;
        
        try {
            const url = createQuery(`${this._url}/${this._dataStoreType}`, {
                prefix, limit
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
        const url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
            entryKey: key,
            scope: this._dataStoreScope,
            dataStoreName: this._dataStoreName
        });
        try {
            return await this._universe._fetch(url, 'DELETE');
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
        if (this._cache[dataStoreName]) return this._cache[dataStoreName];
        
        const newDataStore = new DataStore(this._universe, dataStoreName);
        this._cache[dataStoreName] = newDataStore;

        return newDataStore;
    };

    // /**
    //  * Bulk saves to a datastore. (Maybe later.)
    //  * @param {Array<{key: String, value: any, attributes: {userids: Array<int64>, metadata: Array<any>}}>} entries 
    //  */
    // async SetBulkAsync(entries) {

    // }
};

module.exports = DataStore;