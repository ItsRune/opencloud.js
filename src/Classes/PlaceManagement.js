const fs = require('fs/promises');
const urls = require('../Utils/uris.json');

class PlaceManagement {
    constructor(universe) {
        if (!universe.isUniverse && !universe.isUniverse()) throw new Error("universe must be provided");

        this._universe = universe;
        this._baseurl = urls.OPENCLOUD_PLACE_MANAGEMENT + `/${this._universe._id}`;
    };

    /**
     * Publishes the universe's place with the specified rblx file.
     * @param {Number} placeId 
     * @param {String} routeToFile 
     * @returns Response Data
     */
    async PublishAsync(placeId, routeToFile) {
        try {
            const data = await fs.readFileSync(routeToFile);
            const res = await this._universe._fetch(this._baseurl + "/publish", "POST", {
                
            }, {
                "Content-Type": "application/xml",
            });

            if (res.versionNumber) return {success: true, versionNumber: res.versionNumber, error: null};
            throw new Error({success: res.status, error: res.statusText});
        } catch(error) {
            throw error;
        };
    };

    /**
     * Saves the universe's place without publishing it.
     * @param {Number} placeId 
     * @param {String} routeToFile 
     */
    async SaveAsync(placeId, routeToFile) {
        try {
            await fs.access(routeToFile);
        } catch(error) {
            throw error;
        };

        const fileData = await fs.stat(routeToFile);
        if (fileData.size / (1024 * 1024) > 100) throw new Error("File size must be less than 100MB");
        
        const file = await fs.readFile(routeToFile);

        const res = await this._universe._fetch(this._baseurl + `/places/${placeId}?versionType=Saved`, "POST", file, {
            "Content-Type": "application/xml",
        });

        if (res.versionNumber) return {success: true, versionNumber: res.versionNumber, error: null};
        throw new Error({success: res.status, error: res.statusText});
    };
}

module.exports = PlaceManagement;