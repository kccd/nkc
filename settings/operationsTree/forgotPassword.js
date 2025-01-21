const { Operations } = require('../operations.js');
module.exports = {
  mobile: {
    GET: Operations.visitFindPasswordByMobile,
    PUT: Operations.modifyPasswordByMobile,
  },
  email: {
    GET: Operations.visitFindPasswordByEmail,
    POST: Operations.findPasswordSendVerifyEmail,
    PUT: Operations.modifyPasswordByEmail,
  },
};
