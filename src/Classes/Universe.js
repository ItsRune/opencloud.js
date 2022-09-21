const packages = require('../Utils/packages.json');

const axios = require(packages.fetch);
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

            if (typeof(JSON.stringify(body)) !== "string") {
                body = JSON.stringify(body);
            };

            const res = await axios(url, {
                method,
                headers,
                data: body
            });
            
            if (res.status === 200) return { success: true, data: res.data };
            return { success: true, error: null };
        } catch(error) {
            if (!error.response) throw error;
            const res = error.response

            if (res.status === 401) throw new Error("Error: Invalid API Key");
            if (res.status === 403) throw new Error("Error: API key does not permit this service.");
            if (res.status >= 500) throw new Error("Error: Internal Server Error");

            if (res.data) {
                const keys = Object.keys(res.data);

                if (keys.indexOf('errorDetails') != -1) {
                    throw new Error(`${res.data.message} (Code: ${res.status})`);
                };
            };

            throw new Error(`${res.statusText} (Code: ${res.status})`);
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