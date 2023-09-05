const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitHome,
  community: {
    GET: Operations.visitHome,
  },
  column: {
    GET: Operations.visitHome,
  },
  zone: {
    GET: Operations.visitHome,
  },
};
