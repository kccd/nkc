const { Operations } = require('../operations.js');
module.exports = {
  wechat: {
    POST: Operations.receiveWeChatPaymentInfo,
    PARAMETER: {
      GET: Operations.postWeChatPayInfo,
    },
  },
  alipay: {
    POST: Operations.receiveAliPayPaymentInfo,
    PARAMETER: {
      GET: Operations.postAliPayInfo,
    },
  },
};
