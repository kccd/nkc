const data = {
  _id: 'score',
  c: {
    // 鼓励转账金额限制
    creditMin: 1, // 最小金额
    creditMax: 1000, // 最大金额
    // 附件上传下载扣除的积分类型
    attachmentScore: 'score1',
    // 鼓励扣除的积分类型
    creditScore: 'score1',
    // 商品交易使用的积分
    shopScore: 'score1',
    // 修改用户名使用的积分
    usernameScore: 'score1',
    // 去水印使用的积分
    watermarkScore: 'score1',
    // 发表奖励
    postRewardScore: 'score1',
    // 精选奖励
    digestRewardScore: 'score1',
    // 分享奖励
    shareRewardScore: 'score1',
    // 问卷调查奖励
    surveyRewardScore: 'score1',
    // 银行名称
    nkcBankName: '科创人民很行',
    // 交易系统
    scores: [
      {
        type: 'score1',
        enabled: true,
        // 积分名称
        name: '积分一',
        // 积分图标，自定义时此字段为attachmentId
        icon: '',
        // 积分单位
        unit: '分',
        // 兑出
        score2other: false,
        // 兑入
        other2score: false,
        // 积分比重
        weight: 1,
      },
      {
        enabled: false,
        type: 'score2',
        name: '积分二',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      {
        enabled: false,
        name: '积分三',
        type: 'score3',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      {
        enabled: false,
        type: 'score4',
        name: '积分四',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      {
        enabled: false,
        type: 'score5',
        name: '积分五',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      {
        enabled: false,
        type: 'score6',
        name: '积分六',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      {
        enabled: false,
        type: 'score7',
        name: '积分七',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
    ]
  }
};
module.exports = data;
