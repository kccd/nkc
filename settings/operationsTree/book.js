const { Operations } = require('../operations.js');
module.exports = {
  PARAMETER: {
    GET: Operations.getBook,
    member: {
      invitation: {
        GET: Operations.bookInvitation,
        POST: Operations.bookInvitation,
      },
    },
    options: {
      GET: Operations.getBook,
    },
  },
};
