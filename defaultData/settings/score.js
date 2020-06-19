module.exports = {
  _id: 'score',
  c: {
    // 金钱的比重
    moneyWeight: 1,
    // 交易系统
    scores: [
      {
        enabled: true,
        // 积分类型
        type: 'score1',
        // 积分名称
        name: '积分1',
        // 积分图标，自定义时此字段为attachmentId
        icon: '',
        // 积分单位
        unit: '分',
        // 是否允许充值
        money2score: false,
        // 兑出
        score2other: false,
        // 兑入
        other2score: false,
        // 是否允许提现
        score2money: false,
        // 积分比重
        weight: 1,
      },
      {
        enabled: true,
        type: 'score2',
        name: '积分2',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
        weight: 1,
      },
      {
        enabled: false,
        type: 'score3',
        name: '积分3',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
        weight: 1,
      },
      {
        enabled: false,
        type: 'score4',
        name: '积分4',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
        weight: 1,
      },
      {
        enabled: false,
        type: 'score5',
        name: '积分5',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
        weight: 1,
      }
    ]
  }
};
