const sha1 = require('sha1');

const pwdHashed = (pwd) => sha1(pwd);

module.exports = pwdHashed;