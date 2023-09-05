const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.complaintGet,
  POST: Operations.complaintPost,
  resolve: {
    POST: Operations.complaintResolvePost,
  },
  type: {
    GET: Operations.complaintPost,
  },
};
