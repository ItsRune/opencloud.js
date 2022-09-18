const fs = require('fs');
const urls = require('../Utils/uris.json');

class PlaceManagement {
    constructor(universe) {
        if (!universe.isUniverse && !universe.isUniverse()) throw new Error("universe must be provided");

        this._universe = universe;
        this._baseurl = urls.OPENCLOUD_PLACE_MANAGEMENT + `/${this._universe._id}`;
    };

    /**
     * Updates the universe's place with the specified rblx file.
     * @param {Number} placeId 
     * @param {String} routeToFile 
     * @returns Response Data
     */
    async PublishAsync(placeId, routeToFile) {
        try {
            const data = await fs.readFileSync(routeToFile);
            return await this._universe._fetch(this._baseurl + "/publish", "POST", {
                
            }, {
                "Content-Type": "application/xml",
            });
        } catch(error) {
            throw error;
        };
    };
}

module.exports = PlaceManagement;