const fs = require('fs');
const {promisify} = require('util');
module.exports = {
  access: promisify(fs.access),
  unlink: promisify(fs.unlink),
  rename: promisify(fs.rename),
  writeFile: promisify(fs.writeFile),
  mkdir: promisify(fs.mkdir),
  exists: promisify(fs.exists),
  existsSync: fs.existsSync,
  copyFile: promisify(fs.copyFile),
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream,
  stat: promisify(fs.stat)
};