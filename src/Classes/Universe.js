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

    // /**
    //  * Initializes and generates the Universe object.
    //  * @param {Number} universeId 
    //  * @param {String} apiKey 
    //  * @param {Boolean} _dontCreate 
    //  * @returns Universe
    //  */
    // static async generate(universeId, apiKey) {
        
    // }

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
            }

            const data = await fetch(url, {
                method,
                headers,
                body
            });

            if (data.status === 200) {
                return await data.json();
            };

            console.log(data);

            throw new Error("Not found");
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