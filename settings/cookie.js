const {readFileSync, writeFileSync} = require('fs');
const {randomBytes} = require('crypto');

let secret = '';
const secretFile = 'secret.txt';
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