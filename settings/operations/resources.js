const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.getResources,
  md5: {
    POST: Operations.uploadResources,
  },
};
