const { TextChannel, Message, Guild } = require("discord.js");

const Cache = require("../cache/Cache");

class Discord {

    utils;
    
    constructor(utils) {
        this.utils = utils;
    }

    /**
     * Cache for Discord users
     * @type {Cache}
     */
    userCache = new Cache(1 * 60 * 60 * 1000); // 1 hour cache

    /**
     * Various Discord guilds
     * @type {{tms:Guild,tlms:Guild,cl:Guild}}
     */
    guilds = {
        tms: null,
        tlms: null,
        cl: null,
    }

    /**
     * Various Discord channels
     * @type {{ban:{tms:TextChannel,tlms:TextChannel,hide:TextChannel},live:TextChannel,archiveRequest:TextChannel}}
     */
    channels = {
        ban: {
            tms: null,
            tlms: null,
            hide: null,
        },
        live: null,
        archiveRequest: null,
    }

    /**
     * Various Discord messages
     * @type {{globalTimeout:Message,globalBan:Message}}
     */
    messages = {
        globalTimeout: null,
        globalBan: null,
    };

    /**
     * Records if message content has changed
     * @type {boolean}
     */
    messageChanges = false;

    /**
     * Carries cached timeout content
     * @type {string}
     */
    timeoutContent = "";

    /**
     * Carries cached ban content
     * @type {string}
     */
    banContent = "";

    /**
     * Internal method for retrieving a user if it is not present in the database
     * @param {string} id 
     */
    getUserByIdByForce(id) {
        return new Promise((resolve, reject) => {
            global.client.modbot.users.fetch(id).then(async user => {
                const discordUser = await this.utils.Schemas.DiscordUser.create({
                    _id: user.id,
                    globalName: user.globalName,
                    displayName: user.displayName,
                    discriminator: user.discriminator,
                    avatar: user.avatar,
                });
                resolve(discordUser);
            }, reject);
        });
    }

    /**
     * Gets a user based on a Discord user ID.
     * @param {string} id 
     * @param {?boolean} overrideCache
     * @param {?boolean} requestIfUnavailable
     * 
     * @returns {Promise<any>}
     */
    getUserById(id, overrideCache = false, requestIfUnavailable = false) {
        return this.userCache.get(id, async (resolve, reject) => {
            const discordUser = await DiscordUser.findById(id)
                    .populate("identity");
            if (discordUser) {
                resolve(discordUser);
            } else {
                if (requestIfUnavailable) {
                    this.getUserByIdByForce(id).then(resolve, reject);
                } else {
                    reject("User not found");
                }
            }
        }, overrideCache);
    }

    /**
     * Initializes Discord-related services
     * @returns {Promise<null>}
     */
    async init() {
        this.guilds.tms = await global.client.mbm.guilds.fetch(process.env.DISCORD_GUILD_TMS);
        this.guilds.tlms = await global.client.mbm.guilds.fetch(process.env.DISCORD_GUILD_TLMS);
        this.guilds.cl = await global.client.mbm.guilds.fetch(process.env.DISCORD_GUILD_CL);

        this.channels.ban.tms = await global.client.mbm.channels.fetch(process.env.DISCORD_CHANNEL_BAN_TMS);
        this.channels.ban.tlms = await global.client.mbm.channels.fetch(process.env.DISCORD_CHANNEL_BAN_TLMS);
        this.channels.ban.hide = await global.client.mbm.channels.fetch(process.env.DISCORD_CHANNEL_BAN_HIDE);
        this.channels.live = await global.client.modbot.channels.fetch(process.env.DISCORD_CHANNEL_LIVE);

        this.channels.archiveRequest = await global.client.mbm.channels.fetch(process.env.DISCORD_CHANNEL_ARCHIVE_REQUEST);

        this.utils.logger.log("info", `Using guilds: TMS [${this.guilds.tms.name}] TLMS [${this.guilds.tlms.name}] CL [${this.guilds.cl.name}]`);
        this.utils.logger.log("info", `Using channel #${this.channels.ban.tms.name} & #${this.channels.ban.tlms.name} for bans, #${this.channels.ban.hide.name} for hidden bans, #${this.channels.live.name} for livestreams, #${this.channels.archiveRequest.name} for archive requests`);
        this.utils.logger.log("info", `[MB] Using message (no messages loaded)`);
    }

}

module.exports = Discord;
