const packages = require('../Utils/packages.json');
const axios = require(packages.fetch);

const { OPENCLOUD_UNIVERSES } = require('../Utils/uris.json');
const DataStore = require('./DataStore');
const PlaceManagement = require('./PlaceManagement');
const MessagingService = require('./MessagingService');
const moment = require('moment/moment');

class Universe {
    /**
     * Initializes the Universe class.
     * @param {Number} universeId 
     * @param {String} apiKey 
     * @param {{useDataStoreCache: Boolean, useMomentJs: Boolean}} [options] 
     */
    constructor(universeId, apiKey, options) {
        options = (typeof(options) === "object") ? options : { useDataStoreCache: false, useMomentJs: false };
        
        this._options = options;
        this._id = universeId;
        this._apiKey = apiKey;
        this._dsCache = {};
        this._url = OPENCLOUD_UNIVERSES + `/${this._id}`;
        
        this.DataStoreService = new DataStore(this);
        this.PlaceManagementService = new PlaceManagement(this);
        this.MessagingService = new MessagingService(this);
    };

    /**
     * Sends a request with the api key to the opencloud's api point.
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

            let data = res.data;
            let keys = Object.keys(data);

            if (keys.indexOf("entryValue") != -1) {
                data = JSON.parse(data.entryValue);
            };

            // TODO: Implement datastore caching with [key] = value.
            // if (this._options.useDataStoreCache) {
                
            // }

            if (this._options.useMomentJs) {
                let timeMap = keys.map((v) => v.toLowerCase().includes("time"));
                if (timeMap.length > 0) {
                    timeMap.forEach((v, i) => {
                        if (v == true) data[keys[i]] = moment(data[keys[i]]);
                    });
                };
            }
            
            if (res.status === 200) return { success: true, data };
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
     * Changes api key.
     * @param {String} apiKey
     */
     setApiKey(apiKey) {
        this._apiKey = apiKey;
    };

    /**
     * Changes the universe id.
     * @param {Number} universeId
     */
    setUniverseId(universeId) {
        this._id = universeId;
    };

    /**
     * For internal uses.
     * @returns {Boolean}
     */
    isUniverse() {
        return true;
    };
};

module.exports = Universe;