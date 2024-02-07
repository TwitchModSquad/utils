const mongoose = require("mongoose");

module.exports = function(utils) {
    const schema = new mongoose.Schema({
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        user: {
            type: String,
            ref: "TwitchUser",
            required: true,
        },
    });
    
    return mongoose.model("GroupUser", schema);
}
