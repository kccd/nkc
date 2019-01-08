const {readFileSync, writeFileSync} = require('fs');
const {randomBytes} = require('crypto');
const path = require('path');
let secret = '';
const secretFile = path.resolve('./', 'secret.txt');
try {
  secret = readFileSync(secretFile, 'utf8');
} catch(e) {
  secret = randomBytes(128).toString('hex');
  writeFileSync(secretFile, secret, 'utf8');
}
module.exports = {
  secret,
  life: 86400 * 30 * 1000
};