const uris = require('../Utils/uris.json');

class MessagingService {
    constructor(universe) {
        if (!universe.isUniverse && !universe.isUniverse()) throw new Error("universe must be provided");
        
        this._universe = universe;
        this._baseurl = uris.OPENCLOUD_MESSAGES + `/${this._universe._id}`;
    };

    /**
     * Sends a message to the universe using the specific topic.
     * @param {String} topic
     * @param {String} message 
     */
    async PublishAsync(topic, message) {
        const url = this._baseurl + `/topics/${topic}`;

        try {
            const res = await this._universe._fetch(url, "POST", {
                message: message
            }, {
                "Content-Type": "application/text"
            });

            if (res.success) return {success: true, error: null};
            throw new Error({success: res.status, error: res.statusText});
        } catch(error) {
            throw error;
        };
    };
}

module.exports = MessagingService;