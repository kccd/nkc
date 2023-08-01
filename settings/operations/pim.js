const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.PIMPublic,
  teams: {
    GET: Operations.PIMPublic,
    POST: Operations.PIMPublic,
  },
  team: {
    PARAMETER: {
      GET: Operations.PIMPublic,
    },
  },
};
