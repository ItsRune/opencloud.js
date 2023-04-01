const fs = require('fs');
const path = require('path');
const createCustomError = require('../Modules/createCustomError');
const createQuery = require('../Modules/createQuery');
const getCallerPath = require('../Modules/getCallerPath');
const urls = require('../Utils/uris.json');
const FormData = require('form-data');

class AssetService {
    /**
     * Constructs the Assets class.
     * @param {Universe} universe
     */
    constructor(universe) {
        if (!universe.isUniverse && !universe.isUniverse()) throw createCustomError("universe must be provided");

        this._universe = universe;
        this._creator = {};
        this._opCache = {};
        this._fee = 0;
    };

    /**
     * Determines whether the creator field is filled out.
     * @returns {Boolean} isOk
     */
    #checkCreator() {
        return (this._creator["userId"] !== undefined || this._creator["groupId"] !== undefined);
    }

    /**
     * Makes sure the assetType fits the file extension.
     * @param {String} assetType 
     * @param {String} file 
     * @returns {Boolean} isOk
     */
    #checkFileType(assetType, file) {
        const endings = {
            "Decal": [[".png", ".bmp", ".jpeg", ".tga"], "image"],
            "Audio": [[".mp3", ".ogg"], "audio"],
            "Model": [[".fbx"], "model"]
        }
        
        let nameSplit = file.split("\\");
        let fileName = nameSplit[nameSplit.length - 1].split(".")[0];
        
        let associated = endings[assetType];
        if (!associated) return false, null;

        let possibleExtensions = associated[0].filter(e => e === path.extname(file));
        return [(possibleExtensions.length > 0), fileName, `${associated[1]}/${possibleExtensions[0].split(".")[1]}`];
    }

    /**
     * Converts the first letter of a string to uppercase.
     * @param {String} str 
     * @returns {String} Result
     */
    #upperCaseLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Gets an operation's information by it's ID.
     * @param {String} operationId 
     * @returns {Promise} Operation Data
     */
    async GetOperation(operationId) {
        const query = createQuery(`${urls.OPENCLOUD_ASSETS}/operations/${operationId}`);

        try {
            return await this._universe._fetch(query, 'GET');
        } catch(error) {
            throw error;
        }
    }

    /**
     * Sets a new creator for the CreateAsset() method.
     * @param {String} creatorType 
     * @param {Number} creatorId 
     * @returns {AssetService}
     */
    SetCreator(creatorType, creatorId) {
        switch(String(creatorType).toLowerCase()) {
            case "user":
                this._creator["userId"] = creatorId;
                break;
            case "group":
                this._creator["groupId"] = creatorId;
                break;
            default:
                throw createCustomError("creatorType must be either 'user' or 'group'");
        }
        return this;
    }

    /**
     * Sets the price for the CreateAsset() method.
     * @param {Number} price 
     */
    SetPrice(price) {
        if (!Number(price)) throw createCustomError("price must be a number");
        this._fee = Number(price);
    }

    /**
     * Updates an asset's information. (Models can be overwritten)
     * @param {"Decal" | "Model" | "Audio"} assetType
     * @param {Number} assetId
     * @param {String} filePath
     * @param {{
     *  displayName: String?,
     *  description: String?,
     * }} properties
     * @returns {Promise<AxiosResponse>} Request Data
     */
    async UpdateAsset(assetType, assetId, filePath, properties) {
        if (!properties) throw createCustomError("properties must be provided");
        if (!filePath) throw createCustomError("filePath must be provided");
        if (!assetId) throw createCustomError("assetId must be provided");
        if (!this.#checkCreator()) throw createCustomError("Please use SetCreator() before using this method");

        const callerPath = getCallerPath("Assets");
        filePath = path.join(callerPath, filePath);

        const [ isAcceptedFile, fileName, contentType ] = this.#checkFileType(assetType, filePath);
        if (!isAcceptedFile) throw createCustomError(`The file type of ${filePath} is not accepted for ${assetType} assets`);

        const query = createQuery(`${urls.OPENCLOUD_ASSETS}/${assetId}`);
        const request = Object.assign({ assetId }, properties)

        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();

        try {
            formData.append('request', JSON.stringify(request));
            formData.append('fileContent', fileStream, fileName);

            return await this._universe._fetch(query, 'PATCH', formData);
        } catch(error) {
            throw error;
        }
    }

    /**
     * Creates a new asset.
     * @param {String} assetType 
     * @param {String} filePath 
     * @param {String} assetName 
     * @param {String} assetDescription 
     * @returns {Promise} Asset
     */
    async CreateAsset(assetType, filePath, assetName, assetDescription) {
        const query = createQuery(`${urls.OPENCLOUD_ASSETS}/assets`);

        assetType = this.#upperCaseLetter(assetType);
        assetDescription = (assetDescription === undefined) ? "" : assetDescription;

        if (assetDescription.length > 1000) throw createCustomError("assetDescription must be less than 1000 characters");
        if (!this.#checkCreator()) throw createCustomError("Please use SetCreator() before using this method");
        
        let callerPath = getCallerPath("Assets");
        filePath = path.join(callerPath, filePath);
        if (!filePath) throw createCustomError("filePath must be provided");

        let [ isAcceptedFile, fileName, contentType ] = this.#checkFileType(assetType, filePath);
        if (!isAcceptedFile) throw createCustomError(`The file type of ${filePath} is not accepted for ${assetType} assets`);

        let request = {
            creationContext: {
                creator: this._creator, // USED ONLY FOR CREATE ASSET
            },
            displayName: assetName,
            description: assetDescription,
            assetType
        };

        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        // const blobText = JSON.stringify(new Blob([fileStream], { type: contentType }));

        /*
        - Attempted Blobs, Buffers, JSON, File Path, and Streams. None are working.

        Error:
        TypeError: source.on is not a function
            at DelayedStream.create (C:\Users\Rune\OneDrive\Desktop\NodejsProjects\RBX_OpenCloud\node_modules\delayed-stream\lib\delayed_stream.js:33:10)
            at CombinedStream.append (C:\Users\Rune\OneDrive\Desktop\NodejsProjects\RBX_OpenCloud\node_modules\combined-stream\lib\combined_stream.js:45:37)
            at FormData.append (C:\Users\Rune\OneDrive\Desktop\NodejsProjects\RBX_OpenCloud\node_modules\form-data\lib\form_data.js:75:3)
            at AssetService.CreateAsset (C:\Users\Rune\OneDrive\Desktop\NodejsProjects\RBX_OpenCloud\src\Classes\Assets.js:173:18)
            at async doSomething (C:\Users\Rune\OneDrive\Desktop\NodejsProjects\RBX_OpenCloud\src\tests\assets\create.test.js:14:26)

        - Did not change anything and all of a sudden it worked. I have no idea why. Been stuck on this for 3 days... This is so disappointing.
        - I guess I didn't try streams... I'm so dumb.
        */

        try {
            formData.append('request', JSON.stringify(request));
            formData.append('fileContent', fileStream, fileName);

            return await this._universe._fetch(query, 'POST', formData, formData.getHeaders());
        }
        catch(error) {
            throw error;
        }
    }
}

module.exports = AssetService;