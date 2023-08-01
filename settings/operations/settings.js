const { Operations } = require('../operations.js');
module.exports = {
  credit: {
    GET: Operations.getCreditSettings,
  },
  digest: {
    GET: Operations.getDigestSettings,
  },
};
