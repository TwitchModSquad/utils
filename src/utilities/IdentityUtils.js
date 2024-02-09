class IdentityUtils {

    utils;

    constructor(utils) {
        this.utils = utils;
    }

    /**TODO: Create transaction
     * Automatically creates or consolidates identities of all given Discord and Twitch users
     * @param {TwitchUser[]} twitchUsers
     * @param {DiscordUser[]} discordUsers
     */
    consolidateIdentites(twitchUsers = [], discordUsers = []) {
        return new Promise(async (resolve, reject) => {
            let identity = null;
            let additionalUsers = []; // Additional users that are attached to existing identities
            
            const retrieveAdditionalUsers = async identity => {
                const newTwitchUsers = await identity.getTwitchUsers();
                const newDiscordUsers = await identity.getDiscordUsers();
                for (let i = 0; i < newTwitchUsers; i++) {
                    const user = newTwitchUsers[i];
                    if (!twitchUsers.find(x => x._id === user._id) && !additionalUsers.find(x => x._id === user._id))
                        additionalUsers.push(user);
                }
                for (let i = 0; i < newDiscordUsers; i++) {
                    const user = newDiscordUsers[i];
                    if (!discordUsers.find(x => x._id === user._id) && !additionalUsers.find(x => x._id === user._id))
                        additionalUsers.push(user);
                }
            }

            for (let i = 0; i < twitchUsers.length; i++) {
                const user = twitchUsers[i];
                if (user.identity) {
                    await user.populate("identity")
                    if (!identity) {
                        identity = user.identity;
                    } else if (identity._id !== user.identity._id) {
                        if (user.identity.authenticated) {
                            identity.authenticated = true;
                        }
                        if (user.identity.admin) {
                            identity.admin = true;
                        }
                        if (user.identity.moderator) {
                            identity.moderator = true;
                        }
                        if (user.identity.points) {
                            if (!identity.points) identity.points = 0;
                            identity.points += user.identity.points;
                        }
                    }
                    await retrieveAdditionalUsers(identity);
                }
            }
            for (let i = 0; i < discordUsers.length; i++) {
                const user = discordUsers[i];
                if (user.identity) {
                    await user.populate("identity")
                    if (!identity) {
                        identity = user.identity;
                    } else if (identity._id !== user.identity._id) {
                        if (user.identity.authenticated) {
                            identity.authenticated = true;
                        }
                        if (user.identity.admin) {
                            identity.admin = true;
                        }
                        if (user.identity.moderator) {
                            identity.moderator = true;
                        }
                        if (user.identity.points) {
                            if (!identity.points) identity.points = 0;
                            identity.points += user.identity.points;
                        }
                    }
                    await retrieveAdditionalUsers(identity);
                }
            }

            if (!identity) identity = await this.utils.Schemas.Identity.create({});

            for (let i = 0; i < twitchUsers.length; i++) {
                const user = twitchUsers[i];
                user.identity = identity;
                await user.save();
            }
            for (let i = 0; i < discordUsers.length; i++) {
                const user = discordUsers[i];
                user.identity = identity;
                await user.save();
            }
            for (let i = 0; i < additionalUsers.length; i++) {
                const user = additionalUsers[i];
                user.identity = identity;
                await user.save();
            }

            await identity.save();
            resolve(identity);
        });
    }
}

module.exports = IdentityUtils;
