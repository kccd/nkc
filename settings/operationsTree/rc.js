const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.resourceCategory,
  POST: Operations.resourceCategory,
  move: {
    POST: Operations.resourceCategory,
  },
  order: {
    POST: Operations.resourceCategory,
  },
};
