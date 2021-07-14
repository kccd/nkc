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
      min: 1,
      max: 5000,
      defaultMoney: [5, 10, 50, 100, 500, 1000, 5000],
      payment: {
        alipay: {
          enabled: false,
          fee: 0
        },
        wechat: {
          enabled: false,
          fee: 0
        }
      }
    }
  }
};
