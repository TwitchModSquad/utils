const DiscordAuthentication = require("./DiscordAuthentication");
const TwitchAuthentication = require("./TwitchAuthentication");

class Authentication {
    
    /**
     * Methods for Discord authentication
     * @type {DiscordAuthentication}
     */
    Discord;

    /**
     * Methods for Twitch authentication
     * @type {TwitchAuthentication}
     */
    Twitch;

    constructor(utils, helix) {
        this.Discord = new DiscordAuthentication(utils);
        this.Twitch = new TwitchAuthentication(utils, helix);
    }

}

module.exports = Authentication;
