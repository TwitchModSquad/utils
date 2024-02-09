const IdentityUtils = require("./IdentityUtils");
const StringUtils = require("./StringUtils");

class Utilities {

    /**
     * @type {IdentityUtils}
     */
    Identity;

    /**
     * @type {StringUtils}
     */
    String;

    constructor(utils) {
        this.Identity = new IdentityUtils(utils);
        this.String = new StringUtils(utils);
    }

}

module.exports = Utilities;
