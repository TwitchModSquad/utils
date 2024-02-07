const mongoose = require("mongoose");

module.exports = function(utils) {
    const tokenSchema = new mongoose.Schema({
        user: {
            type: String,
            ref: "TwitchUser",
            index: true,
        },
        tokenData: {
            accessToken: {
                type: String,
                required: true,
            },
            expiresIn: Number,
            obtainmentTimestamp: Number,
            refreshToken: String,
            scope: [String],
        },
        uses: {
            type: Number,
            default: 0,
        },
    });
    
    tokenSchema.methods.use = async function() {
        if (this.uses) {
            this.uses++;
        } else this.uses = 1;
        this.last_used = Date.now();
    
        await this.save();
    }
    
    return mongoose.model("TwitchToken", tokenSchema);
}
