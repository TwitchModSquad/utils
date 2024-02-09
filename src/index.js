const mongoose = require("mongoose");
const { StringSelectMenuBuilder, Client, GatewayIntentBits } = require("discord.js");
const {createLogger, Logger, format, transports} = require("winston");
const { combine, timestamp, prettyPrint, colorize, errors } = format;

const Authentication = require("./authentication/");
const Managers = require("./managers/");
const Schemas = require("./schemas/");
const Utilities = require("./utilities/");

class Utils {

    /**
     * Logger for TMS utils
     * @type {Logger}
     */
    logger = createLogger({
        level: "info",
        format: combine(
                errors({ stack: true }),
                colorize(),
                prettyPrint()
            ),
        transports: [
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            })
        ],
        defaultMeta: {service:"utils"},
    });

    /**
     * Holds a Discord Client to be used by utils
     * @type {Client}
     */
    discordClient; 

    /**
     * Holds Authentication methods for Twitch & Discord
     * @type {Authentication}
     */
    Authentication;

    /**
     * @type {Schemas}
     */
    Schemas;

    /**
     * @type {Managers}
     */
    Managers;

    /**
     * @type {Utilities}
     */
    Utilities;

    #registerSchemas(utils) {
        this.logger.log("info","Registering schemas...");
        this.Schemas = new Schemas(utils);
        this.logger.log("info","Schemas registered!");
    }

    #registerManagers(utils) {
        this.logger.log("info","Registering managers...");
        this.Managers = new Managers(utils);
        this.Authentication = new Authentication(utils);
        this.Utilities = new Utilities(utils);
        this.logger.log("info","Managers registered!");
    }

    /**
     * Initializes schema for all Utils objects
     */
    async #schema() {
        this.logger.log("info", "Connecting to MongoDB...");
        await mongoose.connect(process.env.MDB_URL);
        this.logger.log("info", "Connected to MongoDB!");
    }

    /**
     * 
     * @param {{test:boolean?,discordClient:Client}} opts 
     */
    constructor(opts = {}) {
        if (opts?.test) {
            this.logger.level = "error";
        }
        
        this.#schema().catch(err => {
            this.logger.log("error", err);
        });

        this.#registerSchemas(this);
        this.#registerManagers(this);

        if (!opts?.discordClient) {
            this.logger.log("info", "Discord client not provided. Creating one...");

            this.discordClient = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                ],
            });

            this.discordClient.once("ready", client => {
                this.logger.log("info", `Discord client logged in as @${client.user.username}#${client.user.discriminator}`);
                this.Managers.Discord.init().catch(err => this.logger.log("error", err));
            });

            this.discordClient.on("error", err => {
                this.logger.log("error", err);
            });

            this.discordClient.login(process.env.DISCORD_BOT_TOKEN);
        } else {
            this.discordClient = opts.discordClient;
            if (this.discordClient.isReady()) {
                this.logger.log("info", `Provided discord client already logged in as @${this.discordClient.user.username}#${this.discordClient.user.discriminator}`);
                this.Managers.Discord.init().catch(err => this.logger.log("error", err));
            } else {
                this.discordClient.once("ready", client => {
                    this.logger.log("info", `Provided discord client logged in as @${client.user.username}#${client.user.discriminator}`);
                    this.Managers.Discord.init().catch(err => this.logger.log("error", err));
                });
    
                this.discordClient.on("error", err => {
                    this.logger.log("error", err);
                });
            }
        }

        this.#schema();
    }

    /**
     * Generates a user select menu
     * @param {string} type 
     * @param {[]} users 
     */
    userSelect(type, users) {
        if (type === "discord") {
            users.forEach(user => {
                user.display_name = user.displayName;
            });
        }

        return new StringSelectMenuBuilder()
            .setPlaceholder(`View ${type} information`)
            .setCustomId(`user-${type}`)
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(users.map(x => {return {label: x.display_name, value: x._id}}));
    }

    /**
     * Generates a flag select menu
     * @param {any} user
     * @returns {Promise<StringSelectMenuBuilder>}
     */
    flagSelect(user) {
        return new Promise(async (resolve, reject) => {
            let flags = await this.Schemas.Flag.find({});

            const userFlags = (await this.Schemas.UserFlag.find({twitchUser: user._id})).map(x => x.flag);
            flags = flags.filter(x => !userFlags.includes(x._id));

            resolve(new StringSelectMenuBuilder()
                .setPlaceholder("Add user flags")
                .setCustomId(`flag-${user._id}`)
                .setMinValues(1)
                .setMaxValues(flags.length)
                .setOptions(flags.map(x => {return {label: x.name, description: x.description, value: String(x._id), emoji: x.icon ? x.icon : undefined}})));
        })
    }

    /**
     * Updates various user embeds to reflect flag changes
     * @param {any} twitchUser
     * @returns {Promise<void>}
     */
    updateUserFlags(twitchUser) {
        return new Promise(async (resolve, reject) => {
            let channels = {};
            const bans = await this.Schemas.TwitchBan.find({chatter: twitchUser._id});
            const flags = await this.Schemas.UserFlag.find({twitchUser: twitchUser._id})
                .populate("flag");
            for (let i = 0; i < bans.length; i++) {
                const messages = await this.Schemas.DiscordMessage.find({twitchBan: bans[i]._id});
                for (let m = 0; m < messages.length; m++) {
                    const msg = messages[m];

                    if (!channels.hasOwnProperty(msg.channel)) {
                        try {
                            channels[msg.channel] = await global.client.mbm.channels.fetch(msg.channel);
                        } catch(err) {
                            this.logger.log("error", `Unable to find channel ${msg.channel}`);
                            continue;
                        }
                    }
                    let channel = channels[msg.channel];
                    try {
                        const message = await channel.messages.fetch(msg._id);
                        const embed = message.embeds[0];
                        const field = embed.fields.find(x => x.name === "Flags");

                        let flagString = flags
                            .map(x => `\`${x.flag.icon ? x.flag.icon + " " : ""}${x.flag.name}\``)
                            .join(" ");

                        if (flagString === "")
                            flagString = "`No flags!`";
                         
                        if (field) {
                            field.value = flagString;
                        } else {
                            embed.fields.push({
                                name: "Flags",
                                value: flagString,
                                inline: false,
                            });
                        }

                        message.edit({embeds: [embed], components: message.components}).catch(err => this.logger.log("error", err));
                    } catch(err) {
                        this.logger.log("error", err);
                        this.logger.log("error", `Unable to find message ${msg._id}`);
                        continue;
                    }
                }
            }
            resolve();
        });
    }

}

module.exports = Utils;
