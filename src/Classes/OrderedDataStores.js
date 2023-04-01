const PaginateCursor = require('../Modules/paginateCursor');
const createQuery = require('../Modules/createQuery');
const urls = require('../Utils/uris.json');
const createCustomError = require("../Modules/createCustomError");
const Universe = require('./Universe');

class OrderedDataStore {
    /**
     * Constructs the OrderedDataStore class.
     * @param {Universe} universe 
     * @param {String} datastoreName 
     */
    constructor(universe, datastoreName) {
        if (!universe.isUniverse && !universe.isUniverse()) throw createCustomError("universe must be provided");

        this._universe = universe;
        this._url = urls.OPENCLOUD_ORDERED_DATASTORES + `/${this._universe._id}/orderedDataStores`;
        this._scope = "global";
        this._datastoreName = datastoreName;
    };

    /**
     * Sets the datastore's scope.
     * @param {String} scope 
     * @returns {OrderedDataStore}
     */
    SetScope(scope) {
        this._scope = scope;
        return this;
    };

    /**
     * Lists the top matches from the datastore.
     * @param {"desc" | "asc"} sortOrder 
     * @param {Number} limit
     * @param {String} filters - Example: "entry>=20&&entry<=30" (Whitespace is not allowed.)
     * @returns {PaginateCursor}
     */
    async ListAsync(sortOrder = "desc", limit = 100, filters = "") {
        let url = createQuery(`${this._url}/${this._datastoreName}/scope/${this._scope}/entries`, {
            order_by: sortOrder,
            filter: filters,
            max_page_size: (limit > 100 ? 100 : limit)
        });

        const pages = new PaginateCursor(url, "GET", { "Content-Type": "application/json" }, null, "entries", "nextPageToken", "page_token");

        return pages;
    };

    /**
     * Creates an entry within the datastore.
     * @param {String} key 
     * @param {Number} value 
     * @returns {Promise}
     */
    async CreateEntry(key, value) {
        let url = createQuery(`${this._url}/${this._datastoreName}/scope/${this._scope}/entries`, {
            id: key
        });

        try {
            return await this._universe._fetch(url, "POST", {
                value
            });
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * Gets a specific entry from the datastore.
     * @param {String} key 
     * @returns {Promise}
     */
    async GetAsync(key) {
        let url = createQuery(`${this._url}/${this._datastoreName}/scope/${this._scope}/entries/${key}`);

        try {
            return await this._universe._fetch(url, "GET");
        } catch(error) {
            throw error;
        }
    };

    /**
     * Deletes a specific entry from the datastore.
     * @param {String} key 
     * @returns {Promise}
     */
    async RemoveAsync(key) {
        let url = createQuery(`${this._url}/${this._datastoreName}/scope/${this._scope}/entries/${key}`);

        try {
            return await this._universe._fetch(url, "DELETE");
        } catch(error) {
            throw error;
        }
    };

    /**
     * Updates a specific entry from the datastore.
     * @param {String} key 
     * @param {Number} newValue 
     * @param {Boolean} createIfDoesntExist 
     * @returns {Promise}
     */
    async UpdateAsync(key, newValue, createIfDoesntExist = false) {
        let url = createQuery(`${this._url}/${this._datastoreName}/scope/${this._scope}/entries/${key}`, {
            allow_missing: createIfDoesntExist
        });

        try {
            return await this._universe._fetch(url, "PATCH", {
                value: newValue
            });
        } catch(error) {
            throw error;
        }
    };

    /**
     * Increments a specific entry from the datastore.
     * @param {String} key 
     * @param {Number} amount 
     * @returns {Promise}
     */
    async IncrementAsync(key, amount) {
        let url = createQuery(`${this._url}/${this._datastoreName}/scope/${this._scope}/entries/${key}:increment`);

        try {
            return await this._universe._fetch(url, "POST", {
                amount
            });
        } catch(error) {
            throw error;
        }
    };
}

module.exports = OrderedDataStore;