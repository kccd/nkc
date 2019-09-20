const util = require('util');
const fs = require('fs');
const {promisify} = util;

module.exports = {
  unlink: promisify(fs.unlink),
  readFile: promisify(fs.readFile),
  existsSync: fs.existsSync
};