const readFileSync = require('fs').readFileSync;
module.exports = () => ({
  key: readFileSync('ssl/privatekey.pem'),
  cert: readFileSync('ssl/certificate.pem')
});