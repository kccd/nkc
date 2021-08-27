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
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  hits: {
    type: Number,
    default: 0
  },
  uid: {
    type: String,
    required: true
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

/*
* 访问具体页面时判断分享 token 是否有效，如果有效则访问次数 +1
* @param {String} token
* @param {String} 分享类型对应的 ID，若 shareType = post, ID 为 postId
* @return {Boolean} 此 token 是否有权绕过权限
* */
shareSchema.statics.hasPermission = async (token, id) => {
  const ShareModel = mongoose.model('share');
  try{
    const share = await ShareModel.ensureEffective(token, id);
    await share.hit();
    return true;
  } catch(err) {
    return false;
  }
};

/*
* 增加访问次数
* */
shareSchema.methods.hit = async function() {
  this.hits ++;
  await this.updateOne({
    $set: {
      hits: this.hits
    }
  });
  return this.hits;
};


shareSchema.statics.getShareSettingsByPostId = async (pid) => {
  // 如果是分享 post 则需要判断 post 所在专业上的分享设置
  // 如果 post 所在专业一个或多个开启了分享设置则忽略全局 post 分享设置
  const PostModel = mongoose.model('posts');
  const SettingModel = mongoose.model('settings');
  const ForumModel = mongoose.model('forums');
  let {
    status,
    countLimit,
    timeLimit
  } = (await SettingModel.getSettings('share')).post;
  const post = await PostModel.findOnly({pid}, {mainForumsId: 1});
  const {mainForumsId} = post;
  const forums = await ForumModel.find({
    fid: {$in: mainForumsId}
  }, {
    shareLimitTime: 1,
    shareLimitCount: 1,
    shareLimitStatus: 1
  });
  let shareLimitStatus = true;
  let shareLimitCount;
  let shareLimitTime;
  for(const forum of forums) {
    let forumLimitStatus;
    let forumCountLimit;
    let forumTimeLimit;
    if(forum.shareLimitStatus === 'inherit') {
      forumLimitStatus = status;
      forumCountLimit = countLimit;
      forumTimeLimit = timeLimit;
    } else {
      forumLimitStatus = forum.shareLimitStatus === 'on';
      forumCountLimit = forum.shareLimitCount;
      forumTimeLimit = forum.shareLimitTime;
    }

    if(!forumLimitStatus) {
      shareLimitStatus = false;
    }

    if(
      shareLimitCount === undefined ||
      shareLimitCount > forumCountLimit
    ) {
      shareLimitCount = forumCountLimit;
    }
    if(
      shareLimitTime === undefined ||
      shareLimitTime > forumTimeLimit
    ) {
      shareLimitTime = forumTimeLimit;
    }
  }
  if(
    shareLimitTime !== undefined &&
    shareLimitCount !== undefined
  ) {
    countLimit = shareLimitCount;
    timeLimit = shareLimitTime;
    status = shareLimitStatus;
  }
  return {
    status,
    countLimit,
    timeLimit
  };
}

// 根据share的类型判断是否有效
shareSchema.statics.ensureEffective = async function(token, id) {
  const ForumModel = mongoose.model('forums');
  const PostModel = mongoose.model('posts');
  const ShareModel = mongoose.model('share');
  const SettingModel = mongoose.model('settings');
  if(!token) {
    throwErr(403, 'token 无效');
  }
  const share = await ShareModel.findOne({token});
  if(!share) { // 通过该token取数据库查不到数据
    throwErr(403, 'token 无效');
  }
  const {
    tokenType,
    tokenLife,
    toc,
    shareUrl,
    hits
  } = share;
  let {targetId} = share;
  if(tokenLife === 'invalid') throwErr(403, 'token 无效');
  // 历史上存在部分share未记录相应ID值，该部分数据的ID从shareUrl上获得
  if(!targetId) {
    let reg;
    switch(tokenType) {
      case 'forum': reg = RegExp(/\/f\/([0-9a-zA-Z]*)/ig);break;
      case 'thread': reg = RegExp(/\/t\/([0-9a-zA-Z]*)/ig);break;
      case 'post': reg = RegExp(/\/p\/([0-9a-zA-Z]*)/ig);break;
      case 'activity': reg = RegExp(/\/activity\/single\/([0-9a-zA-Z]*)/ig);break;
      case 'user': reg = RegExp(/\/u\/([0-9a-zA-Z]*)/ig);break;
      case 'fund': reg = RegExp(/\/fund\/list\/([0-9a-zA-Z]*)/ig);break;
      case 'fundForm': reg = RegExp(/\/fund\/a\/([0-9a-zA-Z]*)/ig);break;
      default: throwErr(500, `分享类型错误`);
    }
    const arr = reg.exec(shareUrl);
    if(!arr || arr[1]) { // 从shareUrl中无法提取出相应的ID
      await share.updateOne({tokenLife: 'invalid'});
      throwErr(500,'分享数据 ID 缺失');
    }
    targetId = arr[1];
  }
  if(id !== undefined && targetId !== id) { // 记录的ID与传入的ID不匹配
    await share.updateOne({tokenLife: 'invalid'});
    throwErr(403, '分享 ID 不匹配');
  }
  const shareSettings = await SettingModel.getSettings('share');

  let settings = shareSettings[tokenType];

  if(tokenType === 'post') {
    // 如果是分享 post 则需要判断 post 所在专业上的分享设置
    // 如果 post 所在专业一个或多个开启了分享设置则忽略全局 post 分享设置
    settings = await ShareModel.getShareSettingsByPostId(targetId);
  }

  const {status, countLimit, timeLimit} = settings;

  if(!status) throwErr(403, `相关类型分享已关闭`);

  // 判断时间
  const difference = Date.now() - new Date(toc).getTime();
  if(difference > 1000 * 60 * 60 * timeLimit) { // token过期
    await share.updateOne({tokenLife: 'invalid'});
    throwErr(403, 'token 过期');
  }

  // 判断访问次数
  if(hits >= countLimit) {
    await share.updateOne({tokenLife: 'invalid'});
    throwErr(403, `token 访问次数超出限制`);
  }

  return share;

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
  const shareRewardScore = await mongoose.model('settings').getScoreByOperationType('shareRewardScore');
  if(clickReward && type === "visit") {
    const record = await KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      scoreType: shareRewardScore.type,
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
      scoreType: shareRewardScore.type,
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
  await this.updateOne(updateObj);
  // await mongoose.model("users").updateUserKcb(uid);
  await mongoose.model('users').updateUserScores(uid);
  return {
    status,
    num
  }
};
/*
* 获取分享链接中的token
* @return {String}
* @author pengxiguaa 2020-12-14
* */
shareSchema.statics.getNewToken = async () => {
  const apiFunction = require('../nkcModules/apiFunction');
  const ShareModel = mongoose.model('share');
  let token, n = 0;
  do{
    n++;
    if(n > 100) {
      throwErr(500, `分享：生成唯一token失败`);
    }
    token = apiFunction.getRandomString("a0", 8);
    const tokenCount = await ShareModel.countDocuments({token});
    if(!tokenCount) break;
  } while(1);
  return token;
};

shareSchema.methods.getShareUrl = async function() {
  const {targetId, tokenType, token} = this;
  const PostModel = mongoose.model('posts');
  const t = `?token=${token}`;
  if(tokenType === 'post') {
    const post = await PostModel.findOne({pid: targetId}, {type: 1, tid: 1, pid: 1});
    if(post.type === 'thread') {
      return `/t/${post.tid}${t}`;
    } else {
      return `/p/${post.pid}${t}`;
    }
  } else if(tokenType === 'forum') {
    return `/f/${targetId}${t}`;
  } else if(tokenType === 'user') {
    return `/u/${targetId}${t}`;
  } else if(tokenType === 'column') {
    return `/m/${targetId}${t}`;
  } else if(tokenType === 'fund') {
    return `/fund/list/${targetId}${t}`;
  } else if(tokenType === 'fundForm') {
    return `/fund/a/${targetId}${t}`;
  } else {
    return `/activity/single/${targetId}${t}`;
  }
}

module.exports = mongoose.model('share', shareSchema, 'share');
