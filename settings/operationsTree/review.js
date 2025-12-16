const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.review,
  PUT: Operations.review,
  post: {
    PUT: Operations.review,
  },
  document: {
    PUT: Operations.review,
  },
  note: {
    PUT: Operations.review,
  },
  user: {
    PUT: Operations.review,
  },
};
