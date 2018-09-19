const readFileSync = require('fs').readFileSync;
module.exports = () => ({
  key: readFileSync('key/soccos.key'),
  cert: readFileSync('key/soccos.crt')
});