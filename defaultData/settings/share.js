const {settingIds} = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.share,
  c: {
    forum: {
      status: true, // 是否开启分享
      countLimit: 10, // 分享链接最大访问次数
      timeLimit: 12, // 分享链接有效时间（小时）
      rewardStatus: false, // 是否开启奖励
      kcb: 0, // 单次点击奖励
      maxKcb: 0, // 同一链接的奖励上限
      rewardCount: 0, // 每天可分享带奖励链接的次数
    },
    thread: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    post: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    user: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    column: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    activity: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    fund: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    fundForm: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    comment: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    article: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    },
    moment: {
      status: true,
      countLimit: 10,
      timeLimit: 12,
      rewardStatus: false,
      kcb: 0,
      maxKcb: 0,
      rewardCount: 0
    }
  }
};
