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
    type: Number,
    default: 1
  },
  options: {
    type: Schema.Types.Mixed,
    default: []
    /*_id: Number, // surveyOptionId
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
    answers: {
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
    },
    // 针对打分类型，投票者投票的范围
    minScore: {
      type: Number,
      default: null,
    },
    maxScore: {
      type: Number,
      default: null
    }*/
  },
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

schema.statics.createSurvey = async (survey) => {
  const SurveyModel = mongoose.model("surveys");
  const SettingModel = mongoose.model("settings");
  const {
    options, reward, permission, type
  } = survey;
  if(!survey.description) throwErr(400, "说名不能为空");
  if(!options || !options.length) throwErr(400, "请至少添加一个选择");
  for(const option of options) {
    if(!option.content) throwErr(400, "选项内容不能为空");
    if(type === "survey" && !option.answers.length) throwErr(400, "请为每个选项至少添加一个答案");
    option.minScore = parseInt(option.minScore);
    option.maxScore = parseInt(option.maxScore);
    if(type === "score") {
      if(option.minScore < 1) throwErr(400, "最小分值不能小于1");
      if(option.maxScore <= option.minScore) throwErr(400, "最大分值必须大于最小分值");
    }
    for(const answer of option.answers) {
      if(!answer.content) throwErr(400, "选项答案内容不能为空");
      answer._id = await SettingModel.operateSystemID("surveyOptionAnswers", 1);
    }
    option._id = await SettingModel.operateSystemID("surveyOptions", 1);
  }
  survey.voteCount = parseInt(survey.voteCount);
  if(type === "vote") {
    if(!survey.voteCount) throwErr(400, "请设置最大可选择选项的数目");
    if(!survey.voteCount > options.length) throwErr(400, "最大可选择数目不能超过选项数目");
  }
  const now = Date.now();
  if((new Date(survey.st)).getTime() >= (new Date(survey.et)).getTime()) throwErr(400, "结束时间必须大于开始时间");
  if((new Date(survey.et)).getTime() <= now) throwErr(400, "结束时间必须大于当前时间");
  const {
    registerTime, digestThreadCount, threadCount, postCount, voteUpCount,
    minGradeId, certsId
  } = permission;
  permission.registerTime = parseInt(registerTime);
  permission.digestThreadCount = parseInt(digestThreadCount);
  permission.threadCount = parseInt(threadCount);
  permission.postCount = parseInt(postCount);
  permission.voteUpCount = parseInt(voteUpCount);
  if(!certsId.length) throwErr(400, "请至少勾选一个证书");
  if(!survey.mid) survey.mid = survey.uid;
  survey._id = await SettingModel.operateSystemID("surveys", 1);
  const s = SurveyModel(survey);
  await s.save();
  return s;
};
/*
* 验证用户是否有权限参与投票
* @param {String} uid 用户ID
* @author pengxiguaa 2019-8-29
* */
schema.methods.checkUserPermission = async function(uid) {
  const UserModel = mongoose.model("users");
  const user = await UserModel.findOnly({uid});
  const surveyPost = await mongoose.model("surveyPosts").findOne({uid, surveyId: this._id});
  if(surveyPost) throwErr(403, "你已经提交过了");
  const {
    registerTime, digestThreadCount, threadCount, postCount, voteUpCount, certsId, minGradeId
  } = this.permission;
  const now = Date.now();
  if(now - new Date(user.toc) < registerTime*24*60*60*1000) throwErr(403, "你的账号注册时间太短，无法参与本次调查");
  if(user.digestThreadsCount < digestThreadCount) throwErr(403, "你的精华文章太少，无法参与本次调查");
  if(user.threadCount - user.disabledThreadsCount < threadCount) throwErr(403, "你发表的文章太少，无法发表本次调查");
  if(user.postCount - user.disabledPostsCount < postCount) throwErr(403, "你发表的回复太少，无法参与本次调查");
  if(user.voteUpCount < voteUpCount) throwErr(403, "你收到的点赞太少，无法参与本次调查");
  await user.extendGrade();
  if(user.grade._id < minGradeId) throwErr(403, "账号等级过低");
  if(!user.certs.includes("default")) user.certs.push("default");
  if(!user.certs.includes("scholar") && user.xsf > 0) user.certs.push("scholar");
  for(const certId of user.certs) {
    if(certsId.includes(certId)) return;
  }
  throwErr(403, "证书不符合要求");
};
schema.methods.ensurePostPermission = async function(uid) {
  await this.checkUserPermission(uid);
  if(this.disabled) throwErr(403, "该调查已屏蔽");
  const now = Date.now();
  if(now < new Date(this.st).getTime()) throwErr(403, "调查暂未开始");
  if(now > new Date(this.et).getTime()) throwErr(403, "调查已结束");
};

module.exports = mongoose.model("surveys", schema);