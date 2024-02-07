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
        messages: {
            type: Number,
            default: 1,
        },
        first_message: {
            type: Date,
            default: Date.now,
        },
        last_message: {
            type: Date,
            default: Date.now,
        }
    });
    
    return mongoose.model("TwitchUserChat", schema);
}
