module.exports = {
  GET: 'visitAccount',
  finance: {
    GET: 'visitUserKcb',
    recharge: {
      GET: 'accountRecharge',
      POST: 'rechargePost'
    },
    withdraw: {
      GET: 'accountWithdraw',
      POST: "accountWithdraw"
    }
  }
};