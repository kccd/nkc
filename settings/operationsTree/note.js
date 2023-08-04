const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.viewNote,
  POST: Operations.addNote,
  PARAMETER: {
    GET: Operations.viewNote,
    c: {
      PARAMETER: {
        DELETE: Operations.deleteNote,
        PUT: Operations.modifyNote,
      },
    },
  },
};
