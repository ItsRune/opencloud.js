const urls = require('../Utils/uris.json');
const assert = require('../Modules/assert');
const { createHash } = require('crypto');

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
    };

    /**
     * Gets data from the datastore.
     * @param {String} key 
     * @param {String | undefined} scope 
     * @returns 
     */
    async GetAsync(key) {
        const url = this._url + `/${this._dataStoreType}/datastore/entries/entry?entryKey=${key}&scope=${this._dataStoreScope}&dataStoreName=${this._dataStoreName}`;
        try {
            return await this._universe._fetch(url, 'GET');
        } catch(error) {
            throw error;
        };
    };

    async IncrementAsync(key, amount) {
        if (!Number(amount)) throw new Error("amount must be a number");

        const url = this._url + `/entries/entry/increment?entryKey=${key}&scope=${this._dataStoreScope}&dataStoreName=${this._dataStoreName}`;
        try {
            return await this._universe._fetch(url, 'POST', {
                entryValue: amount
            });
        } catch(error) {
            throw error;
        };
    };

    /**
     * Sets the data at a specific key with the new value.
     * @param {String} key 
     * @param {any} value 
     * @returns Request Data
     */
    async SetAsync(key, value) {
        assert(typeof(key) === "string", "key must be a string");
        
        if (typeof(value) === "object") {
            value = JSON.stringify(value);
        } else if (typeof(value) != "string") {
            value = String(value);
        };
        value = createHash('md5').update(value).digest('base64');

        const url = this._url + `/entries/entry?entryKey=${key}&scope=${this._dataStoreScope}&dataStoreName=${this._dataStoreName}`;
        try {
            return await this._universe._fetch(url, 'POST', {
                // something idk yet
            });
        } catch(error) {
            throw error;
        };
    };

    /**
     * Gets a list of all the datastores.
     * @returns Request Data
     */
    async ListDataStoresAsync() {
        try {
            const url = this._url + `/${this._dataStoreType}/datastore`;
            return this._universe._fetch(url, 'GET');
        } catch(error) {
            throw error;
        };
    };

    /**
     * Removes a key from the datastore.
     * @param {String} key 
     * @returns Request Data
     */
    async RemoveAsync(key) {
        if (typeof(key) !== "string") return new Error("key must be a string");
        const url = this._url + `/entries/entry?entryKey=${key}&scope=${this._dataStoreScope}&dataStoreName=${this._dataStoreName}`;
        try {
            return await this._universe._fetch(url, 'DELETE');
        } catch(error) {
            throw error;
        };
    };

    /**
     * Changes the datastore to use when requests are made.
     * @param {String} dataStoreName 
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
};

module.exports = DataStore;