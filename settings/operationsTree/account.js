const { Operations } = require('../operations.js');
module.exports = {
  finance: {
    recharge: {
      GET: Operations.accountRecharge,
      POST: Operations.rechargePost,
      payment: {
        POST: Operations.accountRecharge,
      },
    },
    withdraw: {
      GET: Operations.accountWithdraw,
      POST: Operations.accountWithdraw,
    },
    exchange: {
      GET: Operations.accountExchange,
      POST: Operations.accountExchange,
    },
  },
  contribute: {
    GET: Operations.visitUserContribute,
  },
  subscribes: {
    GET: Operations.account_subscribe,
    PUT: Operations.account_subscribe,
  },
  subscribe_settings: {
    GET: Operations.account_subscribe,
  },
  subscribe_types: {
    GET: Operations.account_subscribe,
    POST: Operations.account_subscribe,
    PARAMETER: {
      DELETE: Operations.account_subscribe,
      PUT: Operations.account_subscribe,
    },
  },
};
