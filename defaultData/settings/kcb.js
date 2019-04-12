module.exports = {
  _id: 'kcb',
  c: {
    // 银行总金额
    totalMoney: 100000000,
    // 鼓励最小值
    minCount: 1,
    // 鼓励最大值
    maxCount: 500,

    // 提现开启与否
    withdrawStatus: false,
    // 最小提现金额
    withdrawMin: 5000,
    // 最大提现金额
    withdrawMax: 50000,
    // 每天提现次数
    withdrawCount: 3,
    // 允许提现的时间段
    withdrawTimeBegin: Number,
    withdrawTimeEnd: Number
  }
};