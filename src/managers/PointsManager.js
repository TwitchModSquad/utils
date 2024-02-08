const { Message } = require("discord.js");

const HOURS_TO_MILLISECONDS = 3600000;
const URI_REGEX = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
const SPACE_REGEX = / +/g;

class Points {

    utils;

    constructor(utils) {
        this.utils = utils;
    }

    /**
     * Calculates daily points bonus based on streak
     * @param {any} identity 
     * @returns {Promise<number>}
     */
    #calculateBonus(identity) {
        return new Promise(async (resolve, reject) => {
            const logs = await Utils.Schemas.PointLog.find({
                    identity: identity,
                    reason: "daily",
                    cancelDate: null,
                })
                .sort({transferDate: -1})
                .limit(process.env.POINTS_DAILY_STREAK_LIMIT);
            
            let streak = 0;
            let lastDate = Date.now();
            for (let i = 0; i < logs.length; i++) {
                const log = logs[i];

                if (lastDate - log.transferDate.getTime() > (24 + process.env.POINTS_DAILY_PADDING_HRS) * HOURS_TO_MILLISECONDS) {
                    break;
                }

                lastDate = log.transferDate.getTime();
                streak++;
            }

            resolve(process.env.POINTS_DAILY_STREAK_STEP * streak);
        });
    }

    /**
     * Refreshes an identity with the database
     * @param {any} identity
     * @param {Promise<any>} identity 
     */
    async #refreshIdentity(identity) {
        global.utils.Managers.Discord.userCache.removeIdentity(identity._id);
        global.utils.Managers.Twitch.userCache.removeIdentity(identity._id);
        // return await Identity.findById(identity._id);
        return identity;
    }

    /**
     * Adds points to the specified identity
     * @param {any} identity 
     * @param {number} amount 
     * @param {"daily"|"message"|"wos"} reason
     * @param {number} bonus
     * @param {Message} message
     * @param {boolean} supporterBonusEnabled
     * @returns {Promise<number>} The total points of the identity
     */
    addPoints(identity, amount, reason, bonus = 0, message = null, supporterBonusEnabled = true) {
        return new Promise(async (resolve, reject) => {
            identity = await this.#refreshIdentity(identity);

            if (supporterBonusEnabled &&
                identity.supporter &&
                identity.supporter > 0 &&
                process.env.POINTS_AD_SUPPORTER_COUNT >= identity.supporter) {
                const multiplier = process.env[`POINTS_AD_SUPPORTER_${identity.supporter}`];
                if (multiplier) {
                    bonus += Math.floor((amount + bonus) * multiplier);
                }
            }

            if (!identity.points) {
                identity.points = amount + bonus;
            } else {
                identity.points += amount + bonus;
            }

            await identity.save();

            const data = {
                identity: identity,
                reason: reason,
                amount: amount,
                bonus: bonus,
            };
            
            if (message) {
                data.message = message.id;
                data.channel = message.channel.id;
            }
            resolve(await Utils.Schemas.PointLog.create(data));
        });
    }

    /**
     * Removes points from the identity
     * @param {any} identity 
     * @param {number} amount 
     * @param {"ad"|"giveaway"} reason 
     * @returns {Promise<Utils.Schemas.PointLog>} Total points on the identity
     */
    removePoints(identity, amount, reason) {
        return new Promise(async (resolve, reject) => {
            identity = await this.#refreshIdentity(identity);
            if (identity.points < amount) {
                return reject(`Not enough money! Requires \`${global.utils.comma(amount)} points\`, \`${global.utils.comma(identity.points)} points\` present.`);
            }
            identity.points -= amount;
            await identity.save();
            resolve(
                await Utils.Schemas.PointLog.create({
                    identity: identity,
                    reason: reason,
                    amount: amount * -1,
                })
            );
        });
    }

    /**
     * Collects daily points for the listed Identity
     * @param {any} identity 
     * @returns {Promise<number>} Points added
     */
    collectDaily(identity) {
        return new Promise(async (resolve, reject) => {
            const lastDaily = await Utils.Schemas.PointLog.findOne({
                identity: identity,
                reason: "daily",
                transferDate: {
                    $gt: Date.now() - (24 * HOURS_TO_MILLISECONDS),
                },
                cancelDate: null,
            });

            if (lastDaily) {
                return reject(`You have collected daily points too recently! You can collect daily points again in <t:${Math.floor((lastDaily.transferDate.getTime() + (24 * HOURS_TO_MILLISECONDS)) / 1000)}:R>.`);
            }

            const bonusAmount = await this.#calculateBonus(identity);
            const log = await this.addPoints(identity, process.env.POINTS_DAILY_BASE, "daily", bonusAmount);
            resolve(log);
        });
    }

    /**
     * Calculates the message reward based on its content
     * @param {string} content 
     * @returns {{content:number,random:number}}
     */
    #calculateMessageReward(content) {
        content = content
            .replace(URI_REGEX, "")
            .replace(SPACE_REGEX, " ")
            .trim();

        if (content.length < 10) return {content:0,random:0};

        if (content.length < 50) {
            if (Math.random() > content.length / 50) {
                return {content:0,random:0};
            }
        }

        if (Math.random() > .95) return {content:0,random:0};

        const randomAmount = Math.floor(Math.random() * Math.min(content.length, 250) / 25);
        const contentAmount = Math.floor((.08 * Math.min(content.length, 250)) + .2);

        return {content: contentAmount, random: randomAmount}
    }

    /**
     * Collect points from a message
     * @param {any} identity 
     * @param {Message} message 
     * @returns {Promise<number>} Points added
     */
    collectMessage(identity, message) {
        return new Promise(async (resolve, reject) => {
            const recentReward = await Utils.Schemas.PointLog.findOne({
                identity: identity,
                reason: "message",
                transferDate: {
                    $gt: Date.now() - (process.env.POINTS_MESSAGE_COOLDOWN * 60 * 1000),
                },
                cancelDate: null,
            });

            if (recentReward) return;

            const reward = this.#calculateMessageReward(message.cleanContent);
            if (reward.content === 0) return;

            this.addPoints(identity, reward.content, "message", reward.random, message)
                .then(resolve, reject);
        });
    }

}

module.exports = Points;
