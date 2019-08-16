const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const shareSchema = new Schema({
  token: {
    type: String,
    unique: true,
    required: true
  },
  shareUrl: {
    type: String,
    default: null
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true
  },
  hits: {
    type: Number,
    default: 0
  },
  // token的状态
  // invalid 失效
  // effective 有效
  tokenLife: {
    type: String,
    default: "effective"
  },
  // 链接类型
  // thread post user forum
  tokenType: {
    type: String,
    default: null
  },
  targetId: {
    type: String,
    index: 1,
    default: ''
  },
  kcbTotal: {
    type: Number,
    default: 0
  },
  registerKcbTotal: {
    type: Number,
    default: 0
  },
  shareReward: {
    type: Boolean,
    default: true
  },
  registerReward: {
    type: Boolean,
    default: true
  }
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
});



shareSchema.virtual('user')
.get(function() {
  return this._user;
})
.set(function(user) {
  this._user = user;
});

const throwErr = (status, err) => {
  const e = new Error(err);
  e.status = status || 500;
  throw e;
};

// 根据share的类型判断是否有效
shareSchema.statics.ensureEffective = async function(token, id) {
  const ForumModel = mongoose.model('forums');
  const PostModel = mongoose.model('posts');
  const UserModel = mongoose.model('users');
  const ActivityModel = mongoose.model('activity');
  const ShareLimitModel = mongoose.model('shareLimit');
  const ShareModel = mongoose.model('share');
  const FundModel = mongoose.model('funds');
  const ThreadModel = mongoose.model('threads');
  const FundApplicationForumModel = mongoose.model('fundApplicationForms');
  const share = await ShareModel.findOne({token});
  if(!share) { // 通过该token取数据库查不到数据
    throwErr(403, 'token无效');
  }
  const {
    tokenType,
    tokenLife,
    toc,
    shareUrl
  } = share;
  let {targetId} = share;
  if(tokenLife === 'invalid') throwErr(403, 'token无效');
  // 历史上存在部分share未记录相应ID值，该部分数据的ID从shareUrl上获得
  if(!targetId) {
    let reg;
    switch(tokenType) {
      case 'forum': reg = RegExp(/\/f\/([0-9a-zA-Z]*)/ig);break;
      case 'thread': reg = RegExp(/\/t\/([0-9a-zA-Z]*)/ig);break;
      case 'post': reg = RegExp(/\/p\/([0-9a-zA-Z]*)/ig);break;
      case 'activity': reg = RegExp(/\/activity\/single\/([0-9a-zA-Z]*)/ig);break;
      case 'user': reg = RegExp(/\/u\/([0-9a-zA-Z]*)/ig);break;
      case 'fundlist': reg = RegExp(/\/fund\/list\/([0-9a-zA-Z]*)/ig);break;
      case 'fundapply': reg = RegExp(/\/fund\/a\/([0-9a-zA-Z]*)/ig);break;
    }
    const arr = reg.exec(shareUrl);
    if(!arr || arr[1]) { // 从shareUrl中无法提取出相应的ID
      await share.update({tokenLife: 'invalid'});
      throwErr(500,'url数据错误');
    }
    targetId = arr[1];
  }
  if(id !== undefined && targetId !== id) { // 记录的ID与传入的ID不匹配
    await share.update({tokenLife: 'invalid'});
    throwErr(403, 'token无效');
  }
  let defaultLimit = await ShareLimitModel.findOne({type: 'all'});
  if(!defaultLimit) {
    defaultLimit = ShareLimitModel({});
    await defaultLimit.save();
  }
  let shareLimitTime = defaultLimit.shareLimitTime;
  if(tokenType === 'forum') {
    const forum = await ForumModel.findOnly({fid: targetId});
    shareLimitTime = forum.shareLimitTime;
  } else if(tokenType === 'thread') {
    const thread = await ThreadModel.findOnly({tid: targetId});
    const forums = await ForumModel.find({fid: {$in: thread.mainForumsId}});
    let shareLimitTime = 0;
    for(const forum of forums) {
      if(shareLimitTime > forum.shareLimitTime) shareLimitTime = forum.shareLimitTime;
    }
  } else if(tokenType === 'post') {
    const post = await PostModel.findOnly({tid: targetId});
    const forums = await ForumModel.find({fid: {$in: post.mainForumsId}});
    let shareLimitTime = 0;
    for(const forum of forums) {
      if(shareLimitTime > forum.shareLimitTime) shareLimitTime = forum.shareLimitTime;
    }
  } else if(tokenType === 'user') {
    await UserModel.findOnly({uid: targetId});
    const shareLimit = await ShareLimitModel.findOne({shareType: 'user'});
    if(shareLimit) shareLimitTime = shareLimit.shareLimitTime;
  } else if(tokenType === 'activity') {
    await ActivityModel.findOnly({acid: targetId});
    const shareLimit = await ShareLimitModel.findOne({shareType: 'activity'});
    if(shareLimit) shareLimitTime = shareLimit.shareLimitTime;
  } else if(tokenType === 'fundlist') {
    await FundModel.findOnly({_id: targetId});
    const shareLimit = await ShareLimitModel.findOne({shareType: 'fundlist'});
    if(shareLimit) shareLimitTime = shareLimit.shareLimitTime;
  } else if(tokenType === 'fundapply') {
    await FundApplicationForumModel.findOnly({_id: targetId});
    const shareLimit = await ShareLimitModel.findOne({shareType: 'fundapply'});
    if(shareLimit) shareLimitTime = shareLimit.shareLimitTime;
  }
  const difference = Date.now() - new Date(toc).getTime();
  if(difference > 1000*60*60*shareLimitTime) { // token过期
    await share.update({tokenLife: 'invalid'});
    throwErr('token无效');
  }
};
/*
* 计算分享奖励，生成科创币账单，设置分享奖励状态
* @author pengxiguaa 2019--8-16
* */
shareSchema.methods.computeReword = async function(type, ip, port) {
  const SettingModel = mongoose.model("settings");
  const ShareLimitModel = mongoose.model("shareLimit");
  const {share} = await SettingModel.getSettings("redEnvelope");
  let {today} = require("../nkcModules/apiFunction");
  today = today();
  const {
    token, uid, tokenLife, tokenType, targetId, kcbTotal,
    registerKcbTotal, shareReward, registerReward
  } = this;
  let clickReward = true, createUserReward = true;
  if(!uid || uid === "visitor") {
    clickReward = false;
    createUserReward = false;
  }
  const typeSettings = share[tokenType];
  const registerSettings = share.register;
  if(!typeSettings.status) clickReward = false;
  if(!registerSettings.status) createUserReward = false;
  if(!shareReward) clickReward = false;
  if(!registerReward) createUserReward = false;
  if(tokenLife !== "effective") {
    clickReward = false;
    createUserReward = false;
  }
  if(kcbTotal >= typeSettings.maxKcb) clickReward = false;
  if(registerKcbTotal >= registerSettings.maxKcb) createUserReward = false;
  const shares = await mongoose.model("share").find({toc: {$gte: today}, uid});
  let total = 0;
  for(const s of shares) {
    total += s.registerKcbTotal || 0;
  }
  // 针对注册，count字段表示的是"每天获得注册奖励的上限"
  if(total >= registerSettings.count*100) createUserReward = false;
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const shareLimit = await ShareLimitModel.findOnly({shareType: tokenType});
  const updateObj = {
    shareReward: !!clickReward,
    registerReward: !!createUserReward
  };
  let status = false;
  let num = 0;
  if(clickReward && type === "visit") {
    const record = await KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: uid,
      type: "share",
      num: typeSettings.kcb,
      c: {
        type: tokenType,
        token: token,
        targetId: targetId
      },
      ip,
      port,
      description: `分享${shareLimit.shareName}`
    });
    await record.save();
    if(!updateObj.$inc) updateObj.$inc = {};
    updateObj.$inc.kcbTotal = typeSettings.kcb;
    status = true;
    num = typeSettings.kcb;
  }
  if(createUserReward && type === "register") {
    const record = await KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: uid,
      type: "share",
      num: registerSettings.kcb,
      c: {
        type: tokenType,
        token: token,
        targetId: targetId
      },
      ip,
      port,
      description: `分享${shareLimit.shareName}，完成注册`
    });
    await record.save();
    if(!updateObj.$inc) updateObj.$inc = {};
    updateObj.$inc.registerKcbTotal = registerSettings.kcb;
    status = true;
    num = typeSettings.kcb;
  }
  await this.update(updateObj);
  await mongoose.model("users").updateUserKcb(uid);
  return {
    status,
    num
  }
};

module.exports = mongoose.model('share', shareSchema, 'share');