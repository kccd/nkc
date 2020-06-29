module.exports = {
  _id: 'recharge',
  c: {
    withdraw: {
      enabled: false,
      min: 100,
      max: 100,
      countOneDay: 3,
      startingTime: 0,
      endTime: 0,
      aliPay: {
        enabled: false,
        fee: 0,
      },
      weChat: {
        enabled: false,
        fee: 0
      }
    },
    recharge: {
      enabled: false,
      min: 100,
      max: 100000,
      aliPay: {
        enabled: false,
        fee: 0,
      },
      weChat: {
        enabled: false,
        fee: 0
      }
    }
  }
}
