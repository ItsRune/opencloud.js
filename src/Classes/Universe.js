const fetch = require('node-fetch');
const { OPENCLOUD_UNIVERSES } = require('../Utils/uris.json');
const DataStore = require('./DataStore');
const PlaceManagement = require('./PlaceManagement');
const MessagingService = require('./MessagingService');

class Universe {
    constructor(universeId, apiKey) {
        this._id = universeId;
        this._apiKey = apiKey;
        this._url = OPENCLOUD_UNIVERSES + `/${this._id}`;
        
        this.DataStoreService = new DataStore(this);
        this.PlaceManagementService = new PlaceManagement(this);
        this.MessagingService = new MessagingService(this);
    };

    /**
     * Sends a request with the api key to the universe.
     * @param {String} url 
     * @param {String} method 
     * @param {object | undefined} body 
     * @param {object | undefined} overWriteHeaders
     * @returns Data Error
     */
    async _fetch(url, method, body, overWriteHeaders) {
        overWriteHeaders = overWriteHeaders || {};
        try {
            const headers = {
                'x-api-key': this._apiKey,
                'Content-Type': "application/json"
            };

            const headerKeys = Object.keys(overWriteHeaders);
            for (let i = 0; i < headerKeys.length; i++) {
                const key = headerKeys[i];
                headers[key] = overWriteHeaders[key];
            };

            if (body) {
                body = JSON.stringify(body);
            };

            const data = await fetch(url, {
                method,
                headers,
                body
            });

            if (data.status === 401) throw new Error("Error: Invalid API Key");
            if (data.status === 403) throw new Error("Error: Universe does not permit this service.");
            if (data.status >= 500) throw new Error("Error: Internal Server Error");
            if (data.status === 200) {
                try {
                    const json = await data.json();
                    return json;
                } catch(error) {
                    return { success:true, error:null }
                }
            }

            throw new Error(`${data.statusText} (Code: ${data.status})`);
        } catch(error) {
            throw error;
        };
    };

    /**
     * For internal uses.
     * @returns isUniverseClass
     */
    isUniverse() {
        return true;
    };
};

module.exports = Universe;