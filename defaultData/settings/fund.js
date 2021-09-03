module.exports = {
  _id: 'fund',
  c: {
    enableFund: false,
    fundName: '科创基金',
    description: '这是基金描述',
    terms: '这是基金协议',
    money: 0,
    readOnly: false,
    closed: {
      status: false,
      reason: '关闭原因',
      uid: '',
      closingTime: new Date()
    },
    donationDescription: '赞助说明',
    fundPoolDescription: '资金池介绍',

    donation: {
      enabled: false,
      min: 100, // 分
      max: 500000,
      defaultMoney: [500, 1000, 5000, 10000, 50000, 100000, 500000],
      payment: {
        aliPay: {
          enabled: false,
          fee: 0
        },
        wechatPay: {
          enabled: false,
          fee: 0
        }
      }
    }
  }
};
