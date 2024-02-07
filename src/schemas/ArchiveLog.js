const mongoose = require("mongoose");

module.exports = function(utils) {
    const schema = new mongoose.Schema({
        entry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Archive",
            required: true,
        },
        created: Boolean,
        deleted: Boolean,
        newFile: Boolean,
        newUser: Boolean,
        deleteFile: Boolean,
        deleteUser: Boolean,
        updatedField: {
            type: String,
            enum: ["owner", "offense", "description"],
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    });
    
    return mongoose.model("ArchiveLog", schema);    
}
