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
  ips: {
    type: [String],
    default: []
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
    default: false
  },
  registerReward: {
    type: Boolean,
    default: false
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
    await ThreadModel.findOnly({tid: targetId});
    const shareLimit = await ShareLimitModel.findOne({shareType: 'thread'});
    if(shareLimit) shareLimitTime = shareLimit.shareLimitTime;
  } else if(tokenType === 'post') {
    await PostModel.findOnly({pid: targetId});
    const shareLimit = await ShareLimitModel.findOne({shareType: 'post'});
    if(shareLimit) shareLimitTime = shareLimit.shareLimitTime;
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

module.exports = mongoose.model('share', shareSchema, 'share');