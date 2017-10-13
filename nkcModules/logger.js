const bunyan = require('bunyan');
const logger = bunyan.createLogger({
  name: 'nkc'
});
module.exports = logger;