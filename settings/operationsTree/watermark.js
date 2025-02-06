const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.getWatermark,
  media: {
    GET: Operations.getAppsWatermark,
  },
  secret: {
    GET: Operations.getWatermark,
    decode: {
      GET: Operations.decodeSecretWatermark,
    },
  },
};
