const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.test,
  POST: Operations.test,
  PUT: Operations.test,
  PARAMETER: {
    GET: Operations.test,
  },
};
