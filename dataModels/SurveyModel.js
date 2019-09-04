const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  type: { // vote: 简单选择, survey: 问卷调查, score: 打分
    type: String,
    default: "vote",
    index: 1
  },
  // 结果的展示 all: 所有人可见, posted: 已投票用户可见, self: 仅自己和管理员可见
  showResult: {
    type: String,
    default: "all"
  },
  // 总投票人数
  postCount: {
    type: Number,
    default: 0
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
      minScore: {
        type: Number,
        default: 0
      },
      maxScore: {
        type: Number,
        default: 0
      },
      links: {
        type: [String],
        default: []
      },
      resourcesId: {
        type: [String],
        default: []
      },
      // 选择该选项的总人数
      postCount: {
        type: Number,
        default: 0
      },
      // 该选项的总得分
      postScore: {
        type: Number,
        default: 0
      }
    },
    voteCount: {
      type: Number,
      default: 1
    }
     */
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
    visitor: {
      type: Boolean,
      default: false
    },
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
/*
* 检查调查表数据
* @param {Object} survey 调查表数据
* @author pengxiguaa 2019-9-4
* */
schema.statics.checkSurveyData = async (survey) => {
  const SettingModel = mongoose.model("settings");
  const {
    options, reward, permission, type
  } = survey;
  if(type !== "vote" && !survey.description) throwErr(400, "调查说明不能为空");
  if(!options || !options.length) throwErr(400, "请至少添加一个选择");
  for(let i = 0; i < options.length; i++) {
    const option = options[i];
    if(!option.content) throwErr(400, `调查内容${i+1}不能为空`);
    if(!option.answers || !option.answers.length) throwErr(400, "请为每个调查内容至少添加一个选项");
    for(let j = 0; j < option.answers.length; j++) {
      const answer = option.answers[j];
      if(!answer.content) throwErr(400, `调查内容${i+1}的选项内容不能为空`);
      answer.minScore = parseInt(answer.minScore);
      answer.maxScore = parseInt(answer.maxScore);
      if(type === "score") {
        if(answer.minScore < 1) throwErr(400, `调查内容${i+1}的选项最小分值不能小于1`);
        if(answer.maxScore <= answer.minScore) throwErr(400, `调查内容${i+1}的选项最大分值必须大于最小分值`);
      }
      if(!answer._id) answer._id = await SettingModel.operateSystemID("surveyOptionAnswers", 1);
      option.answers[j] = {
        content: answer.content,
        resourcesId: answer.resourcesId,
        links: answer.links,
        minScore: answer.minScore,
        maxScore: answer.maxScore,
        _id: answer._id,
        postCount: answer.postCount || 0,
        postScore: answer.postScore || 0,
        postMaxScore: answer.postMaxScore || 0,
        postMinScore: answer.postMinScore || 0
      }
    }
    option.maxVoteCount = parseInt(option.maxVoteCount);
    option.minVoteCount = parseInt(option.minVoteCount);
    if(type !== "score") {
      if(!option.maxVoteCount) throwErr(400, `调查内容${i+1}的最大选择数量不能小于1`);
      if(option.minVoteCount < 0) throwErr(400, `调查内容${i+1}的最小选择数量不能小于0`);
      if(option.maxVoteCount > option.answers.length) throwErr(400, `调查内容${i+1}的最大选择数量不能大于选项数量`);
      if(option.minVoteCount > option.maxVoteCount) throwErr(400, `调查内容${i+1}的最小选择数量不能大于最大选择数量`);
    }
    if(!option._id) option._id = await SettingModel.operateSystemID("surveyOptions", 1);
    options[i] = {
      content: option.content,
      resourcesId: option.resourcesId,
      links: option.links,
      _id: option._id,
      answers: option.answers,
      postCount: option.postCount || 0,
      maxVoteCount: option.maxVoteCount || 0,
      minVoteCount: option.minVoteCount || 0,
    }
  }
  const now = Date.now();
  if((new Date(survey.st)).getTime() >= (new Date(survey.et)).getTime()) throwErr(400, "结束时间必须大于开始时间");
  if((new Date(survey.et)).getTime() <= now) throwErr(400, "结束时间必须大于当前时间");
  const {
    registerTime, digestThreadCount, threadCount, postCount, voteUpCount,
    minGradeId, certsId, visitor
  } = permission;
  // 如果允许游客参与，则默认允许所有用户参与。
  if(!visitor) {
    permission.registerTime = parseInt(registerTime);
    if(permission.registerTime < 0) throwErr(400, "注册时间不能小于0");
    permission.digestThreadCount = parseInt(digestThreadCount);
    if(permission.digestThreadCount < 0) throwErr(400, "加精文章数目不能小于0");
    permission.threadCount = parseInt(threadCount);
    if(permission.threadCount < 0) throwErr(400, "文章总数不能小于0");
    permission.postCount = parseInt(postCount);
    if(permission.postCount < 0) throwErr(400, "回复总数不能小于0");
    permission.voteUpCount = parseInt(voteUpCount);
    if(permission.voteUpCount < 0) throwErr(400, "点赞数不能小于0");
    permission.minGradeId = parseInt(minGradeId);
    const grades = await mongoose.model("usersGrades").find().sort({_id: 1});
    if(permission.minGradeId < grades[0]._id || permission.minGradeId > grades[grades.length - 1]._id) {
      throwErr(400, "最小用户等级设置错误，请重新选择");
    }
    if(!certsId.length) throwErr(400, "请至少勾选一个证书");
    const certsCount = await mongoose.model("roles").count({_id: {$in: certsId}});
    if(certsCount !== certsId.length) throwErr(400, "证书勾选错误，请重新勾选");
  }
};
/*
* 创建调查表
* @param {Object} survey 调查表数据
* @author pengxiguaa 2019-9-4
* */
schema.statics.createSurvey = async (survey) => {
  await mongoose.model("surveys").checkSurveyData(survey);
  const SettingModel = mongoose.model("settings");
  const SurveyModel = mongoose.model("surveys");
  if(!survey.mid) survey.mid = survey.uid;
  survey._id = await SettingModel.operateSystemID("surveys", 1);
  const s = SurveyModel(survey);
  await s.save();
  return s;
};
/*
* 修改调查表
* @param {Object} survey 调查表数据
* @author pengxiguaa 2019-9-4
* */
schema.statics.modifySurvey = async (survey) => {
  await mongoose.model("surveys").checkSurveyData(survey);
  const SurveyModel = mongoose.model("surveys");
  const {
    st, et,
    reward, permission, description, options, showResult
  } = survey;
  const surveyDB = await SurveyModel.findOnly({_id: survey._id});
  await SurveyModel.updateOne({
    _id: survey._id
  }, {
    $set: {
      st,
      et,
      reward,
      permission,
      description,
      options,
      showResult
    }
  });
  await surveyDB.computePostCount();
};
/*
* 验证用户是否有权限参与投票
* @param {String} uid 用户ID
* @author pengxiguaa 2019-8-29
* */
schema.methods.checkUserPermission = async function(uid) {
  const {
    registerTime, digestThreadCount, threadCount, postCount, voteUpCount, certsId, minGradeId,
    visitor
  } = this.permission;
  if(visitor) return;
  if(!uid) throwErr(403, "作者设定了未登录用户无法参与");
  const UserModel = mongoose.model("users");
  const user = await UserModel.findOnly({uid});
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
/*
* 验证用户是否有权限发起调查
* @param {String} uid 用户ID
* @param {String} type 发表内容的类型。 post: 发表回复, thread: 发表文章
* @author pengxiguaa 2019-9-3
* */
schema.statics.ensureCreatePermission = async (type, userId) => {
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const postSettings = await SettingModel.getSettings("post");
  const {defaultCertGradesId, rolesId, uid, status} = postSettings[type].survey;
  if(!status) return false;
  const user = await UserModel.findOne({uid: userId});
  if(!user) return false;
  if(uid.includes(userId)) return true;
  for(const certId of user.certs) {
    if(certId !== "default" && rolesId.includes(certId)) {
      return true;
    }
  }
  if(rolesId.includes("default")) {
    await user.extendGrade();
    return defaultCertGradesId.includes(user.grade._id);
  } else {
    return false;
  }
};
/*
* 验证用户是否能够投票
* @param {String} uid 用户ID
* @author pengxiguaa 2019-9-2
* */
schema.methods.ensurePostPermission = async function (uid, ip) {
  await this.checkUserPermission(uid);
  let surveyPost;
  if (uid) {
    surveyPost = await mongoose.model("surveyPosts").findOne({uid, surveyId: this._id});
  } else {
    surveyPost = await mongoose.model("surveyPosts").findOne({ip, surveyId: this._id});
  }
  if (surveyPost) throwErr(403, "你已经提交过了");
  if (this.disabled) throwErr(403, "该调查已屏蔽");
  const now = Date.now();
  if (now < new Date(this.st).getTime()) throwErr(403, "调查暂未开始");
  if (now > new Date(this.et).getTime()) throwErr(403, "调查已结束");
};
/*
* 通过内容ID和选项ID获取选项信息
* @param {Number} optionId 内容ID
* @param {Number} answerId 选项ID
* @author pengxiguaa 2019-9-4
* */
schema.methods.getAnswerById = function(optionId, answerId) {
  for(const option of this.options) {
    if(option._id === optionId) {
      for(const answer of option.answers) {
        if(answer._id === answerId) return answer;
      }
    }
  }
};
/*
* 通过内容ID获取内容信息
* @param {Number} optionId 内容ID
* @author pengxiguaa 2019-9-4
* */
schema.methods.getOptionById = function(optionId) {
  for(const option of this.options) {
    if(optionId === option._id) return option;
  }
};
/*
* 计算投票人数以及每个选项的投票人数和总得分
* @author pengxiguaa 2019-9-3
* */
schema.methods.computePostCount = async function() {
  const SurveyPostModel = mongoose.model("surveyPosts");
  const survey = await mongoose.model("surveys").findOne({_id: this._id});
  const posts = await SurveyPostModel.find({surveyId: survey._id});
  const count = posts.length;
  const {options} = survey;
  const optionsObj = {};
  for(const option of options) {
    option.answersObj = {};
    option.postCount = 0;
    for(const answer of option.answers) {
      answer.postCount = 0;
      answer.postScore = 0;
      answer.postMaxScore = 0;
      answer.postMinScore = 0;
      option.answersObj[answer._id] = answer;
    }
    optionsObj[option._id] = option;
  }
  for(const post of posts) {
    const optionPostCount = {};
    for(const o of post.options) {
      const answer = survey.getAnswerById(o.optionId, o.answerId);
      const option = survey.getOptionById(o.optionId);
      if(!answer || !option) continue;
      if(!optionPostCount[option._id]) {
        optionPostCount[option._id] = true;
        option.postCount ++;
      }
      if(this.type === "score") {
        answer.postScore += o.score || 0;
        if(answer.postMinScore > o.score) answer.postMinScore = o.score;
        if(answer.postMaxScore < o.score) answer.postMaxScore = o.score;
      } else {
        if(!o.selected) continue;
        answer.postCount ++;
      }
    }
  }
  for(const o of options) {
    delete o.answersObj;
  }
  await this.update({postCount: count, options});
  return count;
};
/*
* 获取已投票的用户
* @return {[Object]} 用户对象组成的数组
* @author pengxiguaa 2019-9-3
* */
schema.methods.getPostUsers = async function() {
  const posts = await mongoose.model("surveyPosts").find({surveyId: this._id, uid: {$ne: ""}}, {uid: 1});
  const uid = posts.map(p => p.uid);
  return await mongoose.model("users").find({uid: {$in: uid}}, {uid: 1, avatar: 1});
};
module.exports = mongoose.model("surveys", schema);