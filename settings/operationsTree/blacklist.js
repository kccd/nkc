const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.checkBlacklist,
  POST: Operations.addUserToBlacklist,
  DELETE: Operations.removeUserFromBlacklist,
};
