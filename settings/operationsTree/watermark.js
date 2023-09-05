const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.getWatermark,
  PARAMETER: {
    GET: Operations.getAppsWatermark,
  },
};
