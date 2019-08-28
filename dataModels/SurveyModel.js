const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  type: { // vote: 简单选择, survey: 问卷调查, score: 打分
    type: String,
    default: "vote",
    index: 1
  },
  // 针对选择类型，可选择的数量。1: 单项选择, >1: 多项选择
  voteCount: {
    type: String,
    default: 1
  },
  options: [
    {
      _id: Number, // surveyOptionId
      // 选项标题
      content: {
        type: String,
        required: true
      },
      // 选项介绍
      description: {
        type: String,
        default: ""
      },
      // 选项图片
      resourcesId: {
        type: [String],
        default: []
      },
      // 选项链接
      links: {
        type: String,
        default: []
      },
      // 针对问答类型，投票者可选择的答案
      answers: [
        {
          _id: Number, // surveyAnswerId
          content: {
            type: String,
            default: ""
          },
          links: {
            type: [String],
            default: []
          },
          resourcesId: {
            type: [String],
            default: []
          }
        }
      ],
      // 针对打分类型，投票者投票的范围
      minScore: {
        type: Number,
        default: null,
      },
      maxScore: {
        type: Number,
        default: null
      }
    }
  ],
  // 问卷调查的发起人，post.uid
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // post.pid
  pid: {
    type: String,
    default: "",
    index: 1
  },
  // 修改前为post.uid， 修改后为当前修改者的ID
  mid: {
    type: String,
    required: true,
    index: 1
  },
  // 问卷调查的创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 投票的开始时间
  st: {
    type: Date,
    required: true,
    index: 1
  },
  // 投票的截止时间
  et: {
    type: Date,
    required: true,
    index: 1
  },
  // 问卷说明，html
  description: {
    type: String,
    default: ""
  },
  // 投票者的权限
  permission: {
    certsId: { // 证书ID
      type: [String],
      default: ["default"]
    },
    minGradeId: { // 等级ID
      type: Number,
      default: 1
    },
    registerTime: {
      type: Number,
      default: 0
    },
    // 注册时间 不小于30天
    digestThreadCount: {
      type: Number,
      default: 0
    },
    // 精选文章数
    threadCount: {
      type: Number,
      default: 0
    },
    // 文章数
    postCount: {
      type: Number,
      default: 0
    },
    // 支持数
    voteUpCount: {
      type: Number,
      default: 0
    }
  },
  // 奖励
  reward: {
    status: {
      type: Boolean,
      default: false
    },
    // 单次奖励
    onceKcb: {
      type: Number,
      default: 0
    },
    // 总奖励次数
    rewardCount: {
      type: Number,
      default: 0,
    },
    // 已奖励次数
    rewardedCount: {
      type: Number,
      default: 0
    }
  },
  // 是否屏蔽
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: "surveys"
});
module.exports = mongoose.model("surveys", schema);