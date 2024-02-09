const DiscordManager = require("./DiscordManager");
const PointsManager = require("./PointsManager");
const SessionManager = require("./SessionManager");
const TwitchManager = require("./TwitchManager");

class Managers {
    utils;

    /**
     * @type {DiscordManager}
     */
    Discord;

    /**
     * @type {PointsManager}
     */
    Points;

    /**
     * @type {SessionManager}
     */
    Session;

    /**
     * @type {TwitchManager}
     */
    Twitch;


    constructor(utils) {
        this.utils = utils;

        this.Discord = new DiscordManager(utils);
        this.Points = new PointsManager(utils);
        this.Session = new SessionManager(utils);
        this.Twitch = new TwitchManager(utils);
    }
}

module.exports = Managers;
