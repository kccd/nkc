const data = {
  _id: 'score',
  c: {
    // 鼓励转账金额限制
    creditMin: 0.01, // 最小金额
    creditMax: 0.01, // 最大金额
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
    // 银行名称
    nkcBankName: '科创人民很行',
    // 交易系统
    scores: {
      score1: {
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
      score2: {
        enabled: false,
        type: 'score2',
        name: '积分二',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      score3: {
        enabled: false,
        name: '积分三',
        type: 'score3',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      score4: {
        enabled: false,
        type: 'score4',
        name: '积分四',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      },
      score5: {
        enabled: false,
        type: 'score5',
        name: '积分五',
        icon: '',
        unit: '分',
        score2other: false,
        other2score: false,
        weight: 1,
      }
    },
    operations: [
      {
        type: 'postToThread',
        count: 3, // 周期内最多奖励次数
        cycle: 'day', // 周期 day, hour, month
        score1: 0,
        score2: 0,
        score3: 0,
        score4: 0,
        score5: 0
      },
      {
        type: 'postToForum',
        count: 3, // 周期内最多奖励次数
        cycle: 'day', // 周期 day, hour, month
        score1: 0,
        score2: 0,
        score3: 0,
        score4: 0,
        score5: 0
      }
    ]
  }
};

const operations = [
  'postToForum',
  'postToThread',
  'dailyLogin',
  'violation',
  'threadBlocked',
  'postBlocked',
  'subscribeForum',
  'unSubscribeForum',
  'followed',
  'unFollowed',
  'fundDonation',
  'liked',
  'unLiked',
  'reportIssue',
  'digestThread',
  'unDigestThread',
  'waterPay',
  'digestPost',
  'unDigestPost'
];
data.c.operations = [];
for(const o of operations) {
  data.c.operations.push({
    type: o,
    count: 3,
    cycle: 'day',
    score1: 0,
    score2: 0,
    score3: 0,
    score4: 0,
    score5: 0,
  });
}
module.exports = data;
