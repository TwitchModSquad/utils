const Cache = require("../cache/Cache");

const {ApiClient} = require("@twurple/api");
const {RefreshingAuthProvider} = require("@twurple/auth");

const authProvider = new RefreshingAuthProvider({
    clientId: process.env.TWITCH_BOT_CLIENTID,
    clientSecret: process.env.TWITCH_BOT_CLIENTSECRET,
    redirectUri: process.env.DOMAIN_ROOT + "auth/twitch",
});

const api = new ApiClient({ authProvider });

class Twitch {

    utils;

    authProvider = authProvider;

    constructor(utils) {
        this.utils = utils;

        authProvider.onRefresh(async (userId, tokenData) => {
            this.utils.logger.log("info", "Refreshing token for " + userId);
            await this.utils.Schemas.TwitchToken.findOneAndUpdate({
                user: userId,
            }, {
                tokenData,
            }, {
                upsert: true,
                new: true,
            });
        });

        (async () => {
            const tokens = await this.utils.Schemas.TwitchToken.find({});
        
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                authProvider.addUser(token.user, token.tokenData);
            }
        
            this.utils.logger.log("info", `Added ${tokens.length} pre-existing tokens`);
            
            authProvider.addIntentsToUser(process.env.TWITCH_BOT_ID, ["chat"]);
        })();
    }

    /**
     * Twitch Helix API
     * @type {ApiClient}
     */
    Helix = api;

    /**
     * Cache for Twitch users
     * @type {Cache}
     */
    userCache = new Cache(1 * 60 * 60 * 1000); // 1 hour cache

    /**
     * Simple cache of username-ID pairs for quickly retrieving user names
     */
    nameCache = {};

    /**
     * Caches forced queries to avoid multiple requests.
     * @type {{id:string,resolve:Promise,reject:Promise}[]}
     */
    forceCache = [];

    /**
     * Tick to retrieve all users in the cache. This is ran once every 500ms
     */
    async getUserByIdTick() {
        if (this.forceCache.length === 0) return;

        let ids = [];
        for (let i = 0; i < this.forceCache.length; i++) {
            const id = this.forceCache[i].id;
            if (!ids.includes(id)) ids.push(id);
            if (ids.length >= 100) break;
        }

        const users = await api.helix.users.getUsersByIds(ids);
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            let forces = this.forceCache.filter(x => x.id === user.id);

            try {
                const dbUser = await this.utils.Schemas.TwitchUser.findOneAndUpdate(
                    {
                        _id: user.id
                    }, {
                        _id: user.id,
                        login: user.name,
                        display_name: user.displayName,
                        type: user.type,
                        broadcaster_type: user.broadcasterType,
                        description: user.description,
                        profile_image_url: user.profilePictureUrl,
                        offline_image_url: user.offlinePlaceholderUrl,
                        created_at: user.creationDate,
                    }, {
                        upsert: true,
                        new: true,
                    }
                );
    
                forces.forEach(force => {
                    force.resolve(dbUser);
                });
    
                this.forceCache = this.forceCache.filter(x => x.id !== user.id);
            } catch(e) {
                this.utils.logger.log("error", e);
            }
        }
        
        for (let i = 0; i < ids.length; i++) {
            let forces = this.forceCache.filter(x => x.id === ids[i]);
            forces.forEach(force => {
                force.reject("User not found!");
            });
        }

        this.forceCache = this.forceCache.filter(x => !ids.includes(x.id));
    }

    /**
     * Requests a user directly from the Twitch Helix API
     * This method should NEVER be used externally as it can take a substantial amount of time to request and WILL overwrite other data.
     * @param {string} id 
     * @returns {Promise<this.utils.Schemas.TwitchUser>}
     */
    getUserByIdByForce(id) {
        return new Promise(async (resolve, reject) => {
            const user = await this.Helix.users.getUserByIdBatched(id);

            try {
                const dbUser = await this.utils.Schemas.TwitchUser.findOneAndUpdate(
                    {
                        _id: user.id
                    }, {
                        _id: user.id,
                        login: user.name,
                        display_name: user.displayName,
                        type: user.type,
                        broadcaster_type: user.broadcasterType,
                        description: user.description,
                        profile_image_url: user.profilePictureUrl,
                        offline_image_url: user.offlinePlaceholderUrl,
                        created_at: user.creationDate,
                    }, {
                        upsert: true,
                        new: true,
                    }
                );
                resolve(dbUser);
            } catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Gets a user based on a Twitch user ID.
     * @param {string} id 
     * @param {boolean} bypassCache
     * @param {boolean} requestIfUnavailable
     * 
     * @returns {Promise<this.utils.Schemas.TwitchUser>}
     */
    getUserById(id, bypassCache = false, requestIfUnavailable = false) {
        return this.userCache.get(id, async (resolve, reject) => {
            const user = await this.utils.Schemas.TwitchUser.findById(id)
                    .populate("identity");
            if (user) {
                resolve(user);
            } else {
                if (requestIfUnavailable) {
                    this.getUserByIdByForce(id).then(resolve, reject);
                } else {
                    reject("User not found!");
                }
            }
        }, bypassCache);
    }

    /**
     * Requests a user directly from the Twitch Helix API
     * This method should NEVER be used externally as it can take a substantial amount of time to request and WILL overwrite other data.
     * @param {string} login 
     * @returns {Promise<this.utils.Schemas.TwitchUser>}
     */
    getUserByNameByForce(login) {
        return new Promise(async (resolve, reject) => {
            try {
                let helixUser = await api.helix.users.getUserByName(login);

                if (helixUser) {
                    const user = await this.utils.Schemas.TwitchUser.findOneAndUpdate(
                        {
                            _id: helixUser.id,
                        },
                        {
                            _id: helixUser.id,
                            login: helixUser.name,
                            display_name: helixUser.displayName,
                            type: helixUser.type,
                            broadcaster_type: helixUser.broadcasterType,
                            description: helixUser.description,
                            profile_image_url: helixUser.profilePictureUrl,
                            offline_image_url: helixUser.offlinePlaceholderUrl,
                            created_at: helixUser.creationDate,
                        }, {
                            upsert: true,
                            new: true,
                        }
                    );
                    
                    resolve(user);
                } else {
                    reject("User not found!");
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Gets a user based on a Twitch name
     * @param {string} login
     * @param {boolean} requestIfUnavailable default false
     * @param {boolean} bypassCache default false
     * @returns {Promise<this.utils.Schemas.TwitchUser>}
     */
    getUserByName(login, requestIfUnavailable = false, bypassCache = false) {
        login = login.replace("#","").toLowerCase();
        return new Promise(async (resolve, reject) => {
            try {
                if (this.nameCache.hasOwnProperty(login)) {
                    try {
                        const user = await this.getUserById(this.nameCache[login], bypassCache, false);
                        resolve(user);
                        return;
                    } catch(e) {}
                }
                const user = await this.utils.Schemas.TwitchUser.findOne({login: login})
                    .populate("identity");
                if (user) {
                    this.nameCache[user.login] = user._id;
                    resolve(user);
                } else {
                    if (requestIfUnavailable) {
                        this.getUserByNameByForce(login).then(resolve, reject);
                    } else {
                        reject("User not found!");
                    }
                }
            } catch(e) {
                reject(e);
            }
        });
    }

}

module.exports = Twitch;
