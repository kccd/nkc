const { Operations } = require('../operations.js');
module.exports = {
  mobile: {
    GET: Operations.visitFindPasswordByMobile,
    POST: Operations.findPasswordVerifyMobile,
    PUT: Operations.modifyPasswordByMobile,
  },
  email: {
    GET: Operations.visitFindPasswordByEmail,
    POST: Operations.findPasswordSendVerifyEmail,
    PUT: Operations.modifyPasswordByEmail,
    verify: {
      GET: Operations.findPasswordVerifyEmail,
    },
  },
};
