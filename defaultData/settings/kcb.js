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
    withdrawMin: 50,
    // 最大提现金额
    withdrawMax: 500,
    // 每天提现次数
    withdrawCount: 3,
    // 允许提现的时间段
    withdrawTimeBegin: Number,
    withdrawTimeEnd: Number,
    // 提现申请是否需要审核
    withdrawAuth: true
  }
};