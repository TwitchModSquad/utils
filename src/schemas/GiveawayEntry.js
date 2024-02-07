const mongoose = require("mongoose");

module.exports = function(utils) {
    const schema = new mongoose.Schema({
        giveaway: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Giveaway",
            required: true,
        },
        identity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Identity",
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    });
    
    return mongoose.model("GiveawayEntry", schema);
}
