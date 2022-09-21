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
     * @returns {success: Boolean, error: String}
     */
    async PublishAsync(topic, message) {
        const url = this._baseurl + `/topics/${topic}`;

        if (topic.length > 80) throw new Error("Topic length must be less than 80 characters.");
        if (!/^[a-zA-Z0-9]+$/.test(topic)) throw new Error("Topic must be alphanumeric characters only.");

        try {
            const res = await this._universe._fetch(url, "POST", {
                message
            });

            if (res.success) return {success: true, error: null};
            return res;
        } catch(error) {
            throw error;
        };
    };
}

module.exports = MessagingService;