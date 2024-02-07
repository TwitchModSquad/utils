const Archive = require("./Archive");
const ArchiveFile = require("./ArchiveFile");
const ArchiveLog = require("./ArchiveLog");
const ArchiveMessage = require("./ArchiveMessage");
const ArchiveUser = require("./ArchiveUser");

const DiscordBan = require("./DiscordBan");
const DiscordGuild = require("./DiscordGuild");
const DiscordMessage = require("./DiscordMessage");
const DiscordToken = require("./DiscordToken");
const DiscordUser = require("./DiscordUser");

const Flag = require("./Flag");
const UserFlag = require("./UserFlag");

const Giveaway = require("./Giveaway");
const GiveawayEntry = require("./GiveawayEntry");

const Group = require("./Group");
const GroupUser = require("./GroupUser");

const HourlyStat = require("./HourlyStat");

const Identity = require("./Identity");

const PointLog = require("./PointLog");

const Session = require("./Session");

const TwitchBan = require("./TwitchBan");
const TwitchChat = require("./TwitchChat");
const TwitchRole = require("./TwitchRole");
const TwitchTimeout = require("./TwitchTimeout");
const TwitchToken = require("./TwitchToken");
const TwitchUser = require("./TwitchUser");
const TwitchUserChat = require("./TwitchUserChat");

const TwitchStream = require("./TwitchStream");

class Schemas {

    Archive;
    ArchiveFile;
    ArchiveLog;
    ArchiveMessage;
    ArchiveUser;
    DiscordBan;
    DiscordGuild;
    DiscordMessage;
    DiscordToken;
    DiscordUser;

    Flag;
    UserFlag;

    Giveaway;
    GiveawayEntry;

    Group;
    GroupUser;

    HourlyStat;

    Identity;

    PointLog;

    Session;

    TwitchBan;
    TwitchChat;
    TwitchRole;
    TwitchTimeout;
    TwitchToken;
    TwitchUser
    TwitchUserChat;

    TwitchGame;
    TwitchLivestream;
    TwitchStreamStatus;
    TwitchTag;

    constructor(utils) {
        this.Archive = Archive(utils);
        this.ArchiveFile = ArchiveFile(utils);
        this.ArchiveLog = ArchiveLog(utils);
        this.ArchiveMessage = ArchiveMessage(utils);
        this.ArchiveUser = ArchiveUser(utils);

        this.DiscordBan = DiscordBan(utils);
        this.DiscordGuild = DiscordGuild(utils);
        this.DiscordMessage = DiscordMessage(utils);
        this.DiscordToken = DiscordToken(utils);
        this.DiscordUser = DiscordUser(utils);

        this.Flag = Flag(utils);
        this.UserFlag = UserFlag(utils);

        this.Giveaway = Giveaway(utils);
        this.GiveawayEntry = GiveawayEntry(utils);

        this.Group = Group(utils);
        this.GroupUser = GroupUser(utils);

        this.HourlyStat = HourlyStat(utils);

        this.Identity = Identity(utils);

        this.PointLog = PointLog(utils);

        this.Session = Session(utils);

        this.TwitchBan = TwitchBan(utils);
        this.TwitchChat = TwitchChat(utils);
        this.TwitchRole = TwitchRole(utils);
        this.TwitchTimeout = TwitchTimeout(utils);
        this.TwitchToken = TwitchToken(utils);
        this.TwitchUser = TwitchUser(utils);
        this.TwitchUserChat = TwitchUserChat(utils);

        const tStream = TwitchStream(utils);

        this.TwitchGame = tStream.TwitchGame;
        this.TwitchLivestream = tStream.TwitchLivestream;
        this.TwitchStreamStatus = tStream.TwitchStreamStatus;
        this.TwitchTag = tStream.TwitchTag;
    }

}

module.exports = Schemas;
