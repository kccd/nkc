const { Operations } = require('../operations.js');
module.exports = {
  authentication: {
    GET: Operations.OAuthAuthentication,
    POST: Operations.OAuthAuthentication,
    PUT: Operations.OAuthAuthentication,
  },
};
