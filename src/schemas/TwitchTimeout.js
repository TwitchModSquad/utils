const mongoose = require("mongoose");

module.exports = function(utils) {
    const schema = new mongoose.Schema({
        streamer: {
            type: String,
            ref: "TwitchUser",
            required: true,
            index: true,
        },
        chatter: {
            type: String,
            ref: "TwitchUser",
            required: true,
            index: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        time_start: {
            type: Date,
            default: Date.now,
        },
        time_end: {
            type: Date,
            default: null,
        },
        migrate_id: Number,
    });
    
    return mongoose.model("TwitchTimeout", schema);
}
