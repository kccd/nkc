const { Operations } = require('../operations.js');
module.exports = {
  POST: Operations.getShareToken,
  GET: Operations.getShareToken,
  PARAMETER: {
    GET: Operations.visitShareLink,
  },
};
