const readFileSync = require('fs').readFileSync;
module.exports = () => ({
  key: readFileSync('key/key.key'),
  cert: readFileSync('key/crt.crt')
});