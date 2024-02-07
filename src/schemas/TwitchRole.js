const mongoose = require("mongoose");

module.exports = function(utils) {
    const roleSchema = new mongoose.Schema({
        streamer: {
            type: String,
            ref: "TwitchUser",
            required: true,
            index: true,
        },
        moderator: {
            type: String,
            ref: "TwitchUser",
            required: true,
            index: true,
        },
        time_start: {
            type: Date,
            default: Date.now,
        },
        time_end: {
            type: Date,
            default: null,
        },
        source: {
            type: String,
            enum: ["legacy", "gql", "tmi", "helix", "3v.fi"],
            default: "legacy",
        }
    });
    
    return mongoose.model("TwitchRole", roleSchema);
}
