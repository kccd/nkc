const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitLogin,
  POST: Operations.submitLogin,
  qr: {
    GET: Operations.getLoginQRAuthUrl,
    PARAMETER: {
      GET: Operations.visitLoginQRAuthPage,
      POST: Operations.submitLoginQRAuth,
      try: {
        GET: Operations.checkLoginQRStatus,
      },
    },
  },
};
