const Cache = require("../cache/Cache");

class SessionManager {
    utils;

    constructor(utils) {
        this.utils = utils;
    }

    cache = new Cache(1 * 60 * 60 * 1000); // 1 hour cache

    /**
     * Retreives a session by its ID
     * @param {string} id 
     * @param {boolean} overrideCache 
     * @returns {Promise<any>}
     */
    getSessionById(id, overrideCache = false) {
        return this.cache.get(id, async (resolve, reject) => {
            const session = await this.utils.Schemas.Session.findById(id)
                .populate("identity");
            if (session) {
                resolve(session);
            } else {
                reject("Session not found!");
            }
        }, overrideCache, false);
    }

}

module.exports = SessionManager;
