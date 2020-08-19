module.exports = {
  finance: {
    recharge: {
      GET: 'accountRecharge',
      POST: 'rechargePost'
    },
    withdraw: {
      GET: 'accountWithdraw',
      POST: "accountWithdraw"
    }
  },
  contribute: {
    GET: "visitUserContribute"
  },
  subscribes: {
    GET: "account_subscribe",
    PUT: "account_subscribe",
  },
  subscribe_types: {
    GET: "account_subscribe",
    POST: "account_subscribe",
    PARAMETER: {
      DELETE: "account_subscribe",
      PUT: "account_subscribe"
    }
  }
}
