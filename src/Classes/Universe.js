const axios = require('axios');
const moment = require('moment/moment');

const { OPENCLOUD_UNIVERSES } = require('../Utils/uris.json');
const DataStore = require('./DataStore');
const PlaceManagement = require('./PlaceManagement');
const MessagingService = require('./MessagingService');
const Assets = require('./Assets');
const checkOptions = require('../Modules/checkOptions');
const createCustomError = require('../Modules/createCustomError');

class Universe {
    /**
     * Initializes the Universe class.
     * @param {Number} universeId 
     * @param {String} apiKey 
     * @param {{
     *   useMomentJs: Boolean,
     *   useDataStoreCache: Boolean,
     *   cacheUpdateInterval: Number,
     *   dataStoreType: String,
     *   dataStoreScope: String
     * }} [options] 
     */
    constructor(universeId, apiKey, options) {
        this._options = checkOptions(options);
        this._id = universeId;
        this._apiKey = apiKey;
        this._url = OPENCLOUD_UNIVERSES + `/${this._id}`;
        this._dsCache = {};
        
        this.DataStoreService = new DataStore(this, this._options.dataStoreName, this._options.dataStoreType, this._options.dataStoreScope);
        this.PlaceManagementService = new PlaceManagement(this);
        this.MessagingService = new MessagingService(this);
        this.Assets = new Assets(this);

        if (!this._apiKey && !this._options["hideWarnings"]) {
            console.log("[WARNING]: Opencloud.js was not provided with an API key. If you're planning on adding it later, you can ignore this warning.");
        };
    };

    /**
     * Parses the url to get the query parameters.
     * @param {String} url 
     * @param {Array<String>} toLookFor 
     * @returns {{[paramName: String]: any}} result
     */
    #getUrlParams(url, toLookFor) {
        const params = url.split("?")[1].split("&");
        const parsedParams = params.map(v => toLookFor.indexOf(v.split("=")[0]) != -1 ? v : null).filter(v => v !== null);
        let result = {};
        
        for (let i = 0; i < parsedParams.length; i++) {
            const param = parsedParams[i].split("=");
            result[param[0]] = param[1];
        }

        return result;
    }

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

            if (this._options.useDataStoreCache && url.match(/datastore\/entries\/entry/)) {
                let key = "";

                if (method.toLowerCase() === "get" || method.toLowerCase() === "head") {
                    const params = this.#getUrlParams(url, ["dataStoreName", "scope", "entryKey"]);
                    key = `${params.entryKey}_${params.scope}_${params.dataStoreName}`;
                } else key = `${body.entryKey}_${body.scope}_${body.dataStoreName}`;
                
                if (this._dsCache[key] && Date.now() > this._dsCache[key][1]) {
                    return {success:true, data: this._dsCache[key][0], fromCache: true};
                };
            };

            const headerKeys = Object.keys(overWriteHeaders);
            for (let i = 0; i < headerKeys.length; i++) {
                const key = headerKeys[i];
                if (key == "x-api-key") continue; // Prevent overwriting the api key.
                
                headers[key] = overWriteHeaders[key];
            };

            if (headers['Content-Type'] == "application/json" && typeof(JSON.stringify(body)) !== "string") {
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

            if (this._options.useDataStoreCache && url.match(/datastore\/entries\/entry/) !== null) {
                if (method.toLowerCase() == "post") {
                    const key = `${body.entryKey}_${body.scope}_${body.dataStoreName}`;
                    if (this._dsCache[key] && Date.now() > this._dsCache[key][1]) {
                        this._dsCache[key][1] = Date.now() + this._options.cacheUpdateInterval;
                        this._dsCache[key][0] = body.entryValue;
                    } else if (!this._dsCache[key]) {
                        this._dsCache[key] = [data, Date.now()];
                    };
                } else if (method.toLowerCase() == "get") {
                    const toLookFor = [
                        "entryKey",
                        "scope",
                        "dataStoreName"
                    ];
                    const parsedParams = this.#getUrlParams(url, toLookFor);
                    const key = `${parsedParams.entryKey}_${parsedParams.scope}_${parsedParams.dataStoreName}`;

                    if (this._dsCache[key] && Date.now() > this._dsCache[key][1]) {
                        this._dsCache[key][1] = Date.now();
                        this._dsCache[key][0] = data;
                    } else if (!this._dsCache[key]) {
                        this._dsCache[key] = [data, Date.now()];
                    };
                };
            };
            
            if (this._options.useMomentJsForTimeStrings) {
                let timeMap = keys.map((v) => v.toLowerCase().includes("time"));
                if (timeMap.length > 0) {
                    timeMap.forEach((v, i) => {
                        if (v == true) data[keys[i]] = moment(data[keys[i]]);
                    });
                };
            }
            
            if (res.status === 200) return { success: true, data, fromCache: false};
            return { success: true, error: null };
        } catch(error) {
            if (!error.response) throw createCustomError(error.message);

            const res = error.response
            const status = res.status
            const log = createCustomError;

            switch(status) {
                case 401:
                    throw log("API key is invalid.", status);
                case 403:
                    throw log("API key does not permit this service.", status);
                case 404:
                    throw log("Resource not found.", status);
                case 415:
                    throw log("Unsupported Media Type", status);
                case 429:
                    throw log("Too many requests.", status);
                case 500:
                    throw log("Internal Server Error", status);
            };

            if (res.data) {
                const keys = Object.keys(res.data);

                if (keys.indexOf('errorDetails') != -1) {
                    throw log(res);
                };
            };

            throw log(res);
        };
    };

    /**
     * Changes api key.
     * @param {String} apiKey
     */
     setApiKey(apiKey) {
        this._apiKey = apiKey;
        return this;
    };

    /**
     * Changes the universe id.
     * @param {Number} universeId
     */
    setUniverseId(universeId) {
        this._id = universeId;
        return this;
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