const mongoose = require("mongoose");

module.exports = function(utils) {
    const schema = new mongoose.Schema({
        _id: String,
        bans: {
            type: Number,
            default: 0,
        },
        timeouts: {
            type: Number,
            default: 0,
        },
        messages: {
            type: Number,
            default: 0,
        },
        posted: {
            type: Date,
            default: Date.now,
        },
    });
    
    return mongoose.model("HourlyStat", schema);
}
