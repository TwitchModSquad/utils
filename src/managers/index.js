const DiscordManager = require("./DiscordManager");
const PointsManager = require("./PointsManager");
const SessionManager = require("./SessionManager");
const StatsManager = require("./StatsManager");
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
     * @type {StatsManager}
     */
    Stats;

    /**
     * @type {TwitchManager}
     */
    Twitch;


    constructor(utils) {
        this.utils = utils;

        this.Discord = new DiscordManager(utils);
        this.Points = new PointsManager(utils);
        this.Session = new SessionManager(utils);
        this.Stats = new StatsManager(utils);
        this.Twitch = new TwitchManager(utils);
    }
}

module.exports = Managers;
