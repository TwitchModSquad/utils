const mongoose = require("mongoose");

module.exports = function(utils) {
    const schema = new mongoose.Schema({
        entry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Archive",
            required: true,
        },
        channel: String,
        message: String,
    });
    
    return mongoose.model("ArchiveMessage", schema);
}
