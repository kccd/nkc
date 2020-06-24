const data = {
  _id: 'score',
  c: {
    // 允许体现
    withdrawEnabled: false,
    // 最小提现金额
    withdrawMin: 0.01, // 分
    // 最大提现金额
    withdrawMax: 0.01, // 分
    // 每天最大提现次数
    withdrawCountOneDay: 0,
    // 提现时段
    withdrawTimeBegin: 0, // 开始时间点
    withdrawTimeEnd: 0, // 结束时间点
    // 提现手续比例
    withdrawFee: 0.6, // 0.6%
    // 鼓励转账金额限制
    creditMin: 0.01, // 最小金额
    creditMax: 0.01, // 最大金额
    // 交易积分类型
    mainScore: '',
    // 附件上传下载扣除的积分类型
    attachmentScore: 'mainScore',
    // 鼓励扣除的积分类型
    creditScore: 'mainScore',
    // 商品交易使用的积分
    shopScore: 'mainScore',
    // 交易系统
    scores: {
      score1: {
        enabled: true,
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
      score2: {
        enabled: false,
        name: '积分2',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
        weight: 1,
      },
      score3: {
        enabled: false,
        name: '积分3',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
        weight: 1,
      },
      score4: {
        enabled: false,
        name: '积分4',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
        weight: 1,
      },
      score5: {
        enabled: false,
        name: '积分5',
        icon: '',
        unit: '分',
        money2score: false,
        score2other: false,
        other2score: false,
        score2money: false,
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
  'modifyUsername',
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
