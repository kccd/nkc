const { Operations } = require('../operations.js');
module.exports = {
  logs: {
    GET: Operations.getLibraryLogs,
  },
};
