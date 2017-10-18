const crypto = require('crypto');
const {sign, unsign} = require('cookie-signature');

module.exports = {
  encryptInMD5WithSalt: (password, salt) => {
    const md5 = crypto.createHash('md5');
    md5.update(password);
    const hashed = md5.digest('hex') + salt;
    md5.update(hashed);
    return md5.digest('hex')
  },
  encryptInSHA256HMACWithSalt: (password, salt) => {
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(password);
    return hmac.digest('hex')
  },
  sign,
  unsign
};