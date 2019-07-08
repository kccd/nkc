const util = require('util');
const fs = require('fs');
const {promisify} = util;

module.exports = {
  unlink: promisify(fs.unlink),
  existsSync: fs.existsSync
};