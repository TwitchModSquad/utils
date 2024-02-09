require("dotenv").config();
const Utils = require("../index");

const utils = new Utils({
    test: true,
});

module.exports = utils;
