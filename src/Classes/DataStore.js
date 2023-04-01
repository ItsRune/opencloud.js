const { createHash } = require("crypto");
const PaginateCursor = require('../Modules/paginateCursor');
const createQuery = require('../Modules/createQuery');
const urls = require('../Utils/uris.json');
const createCustomError = require("../Modules/createCustomError");
const OrderedDataStore = require('./OrderedDataStores');

class DataStore {
    /**
     * Constructs the DataStore class.
     * @param {Universe} universe
     * @param {String} dataStoreScope
     * @param {String} dataStoreType
     * @param {String} dataStoreName
     */
    constructor(universe, dataStoreName = null, dataStoreType = "standard-datastores", dataStoreScope = "global") {
        if (!universe.isUniverse && !universe.isUniverse()) throw new Error("universe must be provided");

        this._universe = universe;
        this._dataStoreName = dataStoreName;
        this._dataStoreType = dataStoreType;
        this._dataStoreScope = dataStoreScope;
        this._isOrdered = (dataStoreType === "ordered-datastores");
        this._url = (this._isOrdered) ? `${urls.OPENCLOUD_ORDERED_DATASTORES}/${this._universe._id}/orderedDataStores` : `${urls.OPENCLOUD_STANDARD_DATSTORES}/${this._universe._id}`;
        this._cache = {};
    };

    /**
     * Checks if the datastore name is set.
     */
    #checkDataStoreName() {
        if (!this._dataStoreName) throw createCustomError("Please use 'GetDataStore' or 'GetOrderedDataStore' before attempted to use methods.");
    }

    /**
     * Sets the scope of the datastore.
     * @param {String} scope Scope of datastore.
     * @returns {DataStore} DataStore
     */
    SetScope(scope) {
        this._dataStoreScope = scope;
        return this;
    };

    /**
     * 
     * @param {Object} filters 
     * @returns {PaginateCursor} Pages
     */
    async ListAsync(filters) {
        let parsed = {};
        
        for (let key in filters) {
            let data = filters[key];

            if (key == "filter") {
                parsed["filter"] = data;
            } else if (key == "orderBy") {
                parsed["order_by"] = data;
            } else if (key == "pageSize") {
                parsed["max_page_size"] = data;
            }
        };

        let url = createQuery(`${this._url}/${this._dataStoreName}/scopes/{scope}/entries`, parsed);

        try {
            return new PaginateCursor(url, "GET", { "Content-Type":"application/json" }, null, "entries", "nextPageToken");
        } catch(error) {
            throw error;
        };
    };

    /**
     * Gets data from the datastore.
     * @param {String} key 
     * @param {Object} filters
     * @returns Request Data
     */
    async GetAsync(key) {
        this.#checkDataStoreName();
        let url = "";

        if (this._isOrdered) {
            url = createQuery(`${this._url}/${this._dataStoreName}/scopes/{scope}/entries`);
        } else {
            url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
                entryKey: key,
                scope: this._dataStoreScope,
                dataStoreName: this._dataStoreName
            });
        }

        try {
            return await this._universe._fetch(url, 'GET');
        } catch(error) {
            throw error;
        };
    };

    /**
     * Increments an integer value of a datastore key by the amount.
     * @param {String} key 
     * @param {Number} amount 
     * @returns { success: Boolean, error: String }
     */
    async IncrementAsync(key, amount) {
        this.#checkDataStoreName();
        if (!Number(amount)) throw new Error("amount must be a number");
        let url = "";
        let method = "";
        let body = {};

        if (this._isOrdered) {
            url = createQuery(`${this._url}/${this._dataStoreName}/scopes/${this._dataStoreScope}/entries/entry`);
            method = "Patch";
            body = { amount };
        } else {
            url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
                entryKey: key,
                scope: this._dataStoreScope,
                dataStoreName: this._dataStoreName,
                incrementBy: Number(amount)
            });
            method = "Post";
            body = { entryValue: amount };
        }
        
        try {
            return await this._universe._fetch(url, method, body);
        } catch(error) {
            throw error;
        };
    };

    /**
     * Prepares the data for a request to set a new value.
     * @param {any} value 
     * @param {Object} attributes 
     * @returns [ userids, metadata, checkSum ]
     */
    #getParsedDataForSetAsync(value, attributes) {
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

        return [ userids, metadata, checkSum ]
    }

    /**
     * Sets the data at a specific key with the new value.
     * @param {String} key 
     * @param {any} value 
     * @param {Array} userids
     * @param {{userids: Array<int64>, metadata: object}} attributes
     * @returns {{success: Boolean, error: String}}
    */
    async SetAsync(key, value, attributes) {
        this.#checkDataStoreName();
        let url = "";
        let method = "";
        let body = {};
        let headers = {};

        if (this._isOrdered) {
            url = createQuery(`${this._url}/${this._dataStoreName}/scope/${this._dataStoreScope}/entries/${key}`);
            body = { value };
            headers = { "Content-Type": "application/json" };
            method = "PATCH";

            console.log(url);
        } else {
            const [ userids, metadata, checkSum ] = this.#getParsedDataForSetAsync(value, attributes);

            url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
                entryKey: key,
                scope: this._dataStoreScope,
                dataStoreName: this._dataStoreName
            });
            method = "POST";
            body = value;
            headers = {
                "Content-MD5": checkSum,
                "roblox-entry-userids": JSON.stringify(userids),
                "roblox-entry-attributes": (metadata) ? JSON.stringify(metadata) : ""
            };
        };
        
        try {
            return await this._universe._fetch(url, method, body, headers);
        } catch(error) {
            throw error;
        };
    };

    /**
     * Updates the data at a specific key with the new value returned from the function.
     * @param {String} key
     * @param {Function} func
     */
    async UpdateAsync(key, func) {
        if (this._isOrdered) throw createCustomError("Cannot use 'UpdateAsync' on an ordered datastore.");
        this.#checkDataStoreName();

        const data = await this.GetAsync(key);
        if (!data.success) throw createCustomError("Failed to get data from datastore.");

        const newData = func(data.data);
        if (!newData) throw createCustomError("Function does not return a new value.");
        return this.SetAsync(key, newData);
    };

    /**
     * Gets a list of all the datastore keys.
     * @param {String | undefined} prefix
     * @param {Number | undefined} limit
     * @param {String | undefined} nextCursor
     * @returns {PaginateCursor} pages
     */
    async ListDataStoresAsync(prefix, limit) {
        if (this._isOrdered) throw createCustomError("Cannot use 'ListDataStoresAsync' on an ordered datastore.");
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
            throw error;
        };
    };

    /**
     * Removes a key from the datastore.
     * @param {String} key 
     * @returns {Promise} Response
     */
    async RemoveAsync(key) {
        this.#checkDataStoreName();
        if (typeof(key) !== "string") return new Error("key must be a string");
        let url = "";
        let method = "DELETE";

        if (this._isOrdered) {
            url = createQuery(`${this._url}/${this._dataStoreName}/scope/${this._dataStoreScope}/entries/${key}`);
        } else {
            url = createQuery(`${this._url}/${this._dataStoreType}/datastore/entries/entry`, {
                entryKey: key,
                scope: this._dataStoreScope,
                dataStoreName: this._dataStoreName
            });
        }

        try {
            return await this._universe._fetch(url, method);
        } catch(error) {
            throw error;
        };
    };

    /**
     * Changes the datastore to use when requests are made.
     * @param {String} dataStoreName 
     * @param {String} scope
     * @returns DataStoreService
     */
    GetDataStore(dataStoreName, scope) {
        if (this._cache[dataStoreName]) return this._cache[dataStoreName];
        
        const newDataStore = new DataStore(this._universe, dataStoreName, "standard-datastores", scope);
        this._cache[dataStoreName] = newDataStore;

        return newDataStore;
    };

    /**
     * Gets the ordered datastore to use when requests are made.
     * @param {String} dataStoreName
     * @param {String} scope
     * @returns {DataStore} OrderedDataStoreService
     */
    GetOrderedDataStore(dataStoreName, scope) {
        if (this._cache[dataStoreName]) return this._cache[dataStoreName];

        const newDataStore = new OrderedDataStore(this._universe, dataStoreName, scope);
        this._cache[dataStoreName] = newDataStore;

        return newDataStore;
    };
};

module.exports = DataStore;