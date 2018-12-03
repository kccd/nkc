module.exports = {
  type: 'redEnvelope',
  random: {
    close: true,
    awards: [
      {
        "name" : "特等奖",
        "kcb" : 500,
        "chance" : 1,
        "float" : 20
      },
      {
        "name" : "一等奖",
        "kcb" : 50,
        "chance" : 5,
        "float" : 20
      },
      {
        "name" : "二等奖",
        "kcb" : 20,
        "chance" : 14,
        "float" : 20
      },
      {
        "name" : "鼓励奖",
        "kcb" : 5,
        "chance" : 80,
        "float" : 20
      }
    ]
  },
  draftFee: {
    close: true,
    defaultCount: 1,
    minCount: 1,
    maxCount: 5
  },
  share: {
    forum: {
      order: 1,
      name: '专业',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    },
    thread: {
      order: 2,
      name: '文章',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    },
    post: {
      order: 3,
      name: '回复',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    },
    fundlist: {
      order: 4,
      name: '基金项目',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    },
    fundapply: {
      order: 5,
      name: '基金申请表',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    },
    user: {
      order: 6,
      name: '用户名片',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    },
    activity: {
      order: 7,
      name: '活动',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    },
    register: {
      order: 8,
      name: '注册',
      status: false,
      kcb: 1,
      maxKcb: 5,
      count: 5
    }
  }
};