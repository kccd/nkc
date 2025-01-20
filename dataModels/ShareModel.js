const {
  getJsonStringTextSlice,
  getJsonStringText,
} = require('../nkcModules/json');
const { renderHTMLByJSON } = require('../nkcModules/nkcRender/json');
const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const shareTypes = {
  thread: 'thread', // 分享社区文章
  post: 'post', // 分享社区回复或评论
  forum: 'forum', // 分享专业
  user: 'user', // 分享用户
  column: 'column', // 分享专栏
  article: 'article', // 分享独立文章文章
  moment: 'moment', // 分享电文动态
  fund: 'fund', // 分享基金项目
  fundForm: 'fundForm', // 分享基金申请表
  comment: 'comment', // 分享独立文章评论
  activity: 'activity', // 分享活动
};

const shareSchema = new Schema(
  {
    token: {
      type: String,
      unique: true,
      required: true,
    },
    shareUrl: {
      type: String,
      default: null,
    },
    // 创建时间
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    hits: {
      type: Number,
      default: 0,
    },
    uid: {
      type: String,
      required: true,
    },
    // token的状态
    // invalid 失效
    // effective 有效
    tokenLife: {
      type: String,
      default: 'effective',
    },
    // 链接类型
    // thread post user forum
    tokenType: {
      type: String,
      default: null,
    },
    targetId: {
      type: String,
      index: 1,
      default: '',
    },
    kcbTotal: {
      type: Number,
      default: 0,
    },
    registerKcbTotal: {
      type: Number,
      default: 0,
    },
    shareReward: {
      type: Boolean,
      default: true,
    },
    registerReward: {
      type: Boolean,
      default: true,
    },
  },
  {
    toObject: {
      getters: true,
      virtuals: true,
    },
  },
);

shareSchema
  .virtual('user')
  .get(function () {
    return this._user;
  })
  .set(function (user) {
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
  try {
    const share = await ShareModel.ensureEffective(token, id);
    await share.hit();
    return true;
  } catch (err) {
    return false;
  }
};

/*
 * 增加访问次数
 * */
shareSchema.methods.hit = async function () {
  this.hits++;
  await this.updateOne({
    $set: {
      hits: this.hits,
    },
  });
  return this.hits;
};

shareSchema.statics.getShareSettingsByPostId = async (pid) => {
  // 如果是分享 post 则需要判断 post 所在专业上的分享设置
  // 如果 post 所在专业一个或多个开启了分享设置则忽略全局 post 分享设置
  const PostModel = mongoose.model('posts');
  const SettingModel = mongoose.model('settings');
  const ForumModel = mongoose.model('forums');
  let { status, countLimit, timeLimit } = (
    await SettingModel.getSettings('share')
  ).post;
  const post = await PostModel.findOnly({ pid }, { mainForumsId: 1 });
  const { mainForumsId } = post;
  const forums = await ForumModel.find(
    {
      fid: { $in: mainForumsId },
    },
    {
      shareLimitTime: 1,
      shareLimitCount: 1,
      shareLimitStatus: 1,
    },
  );
  let shareLimitStatus = true;
  let shareLimitCount;
  let shareLimitTime;
  for (const forum of forums) {
    let forumLimitStatus;
    let forumCountLimit;
    let forumTimeLimit;
    if (forum.shareLimitStatus === 'inherit') {
      forumLimitStatus = status;
      forumCountLimit = countLimit;
      forumTimeLimit = timeLimit;
    } else {
      forumLimitStatus = forum.shareLimitStatus === 'on';
      forumCountLimit = forum.shareLimitCount;
      forumTimeLimit = forum.shareLimitTime;
    }

    if (!forumLimitStatus) {
      shareLimitStatus = false;
    }

    if (shareLimitCount === undefined || shareLimitCount > forumCountLimit) {
      shareLimitCount = forumCountLimit;
    }
    if (shareLimitTime === undefined || shareLimitTime > forumTimeLimit) {
      shareLimitTime = forumTimeLimit;
    }
  }
  if (shareLimitTime !== undefined && shareLimitCount !== undefined) {
    countLimit = shareLimitCount;
    timeLimit = shareLimitTime;
    status = shareLimitStatus;
  }
  return {
    status,
    countLimit,
    timeLimit,
  };
};

// 根据share的类型判断是否有效
shareSchema.statics.ensureEffective = async function (token, id) {
  const ShareModel = mongoose.model('share');
  const SettingModel = mongoose.model('settings');
  if (!token) {
    throwErr(403, 'token 无效');
  }
  const share = await ShareModel.findOne({ token });
  if (!share) {
    // 通过该token取数据库查不到数据
    throwErr(403, 'token 无效');
  }
  const { tokenType, tokenLife, toc, shareUrl, hits } = share;
  let { targetId } = share;
  if (tokenLife === 'invalid') {
    throwErr(403, 'token 无效');
  }
  // 历史上存在部分share未记录相应ID值，该部分数据的ID从shareUrl上获得
  if (!targetId) {
    let reg;
    switch (tokenType) {
      case 'forum':
        reg = RegExp(/\/f\/([0-9a-zA-Z]*)/gi);
        break;
      case 'thread':
        reg = RegExp(/\/t\/([0-9a-zA-Z]*)/gi);
        break;
      case 'post':
        reg = RegExp(/\/p\/([0-9a-zA-Z]*)/gi);
        break;
      case 'activity':
        reg = RegExp(/\/activity\/single\/([0-9a-zA-Z]*)/gi);
        break;
      case 'user':
        reg = RegExp(/\/u\/([0-9a-zA-Z]*)/gi);
        break;
      case 'fund':
        reg = RegExp(/\/fund\/list\/([0-9a-zA-Z]*)/gi);
        break;
      case 'fundForm':
        reg = RegExp(/\/fund\/a\/([0-9a-zA-Z]*)/gi);
        break;
      case 'article':
        reg = RegExp(/\/m\/([0-9]*)\/a\/([0-9a-zA-Z]*)/gi);
        break;
      case 'comment':
        reg = RegExp(/\/comment\/([0-9a-zA-Z]*)/gi);
        break;
      case 'moment':
        reg = RegExp(/\/zone\/m\/([0-9a-z]*)/gi);
        break;
      default:
        throwErr(500, `分享类型错误`);
    }
    const arr = reg.exec(shareUrl);
    if (!arr || arr[1]) {
      // 从shareUrl中无法提取出相应的ID
      await share.updateOne({ tokenLife: 'invalid' });
      throwErr(500, '分享数据 ID 缺失');
    }
    targetId = arr[1];
  }
  if (id !== undefined && targetId !== id) {
    // 记录的ID与传入的ID不匹配
    await share.updateOne({ tokenLife: 'invalid' });
    throwErr(403, '分享 ID 不匹配');
  }
  const shareSettings = await SettingModel.getSettings('share');

  let settings = shareSettings[tokenType];

  if (tokenType === 'post') {
    // 如果是分享 post 则需要判断 post 所在专业上的分享设置
    // 如果 post 所在专业一个或多个开启了分享设置则忽略全局 post 分享设置
    settings = await ShareModel.getShareSettingsByPostId(targetId);
  }

  const { status, countLimit, timeLimit } = settings;

  if (!status) {
    throwErr(403, `相关类型分享已关闭`);
  }

  // 判断时间
  const difference = Date.now() - new Date(toc).getTime();
  if (difference > 1000 * 60 * 60 * timeLimit) {
    // token过期
    await share.updateOne({ tokenLife: 'invalid' });
    throwErr(403, 'token 过期');
  }

  // 判断访问次数
  if (hits >= countLimit) {
    await share.updateOne({ tokenLife: 'invalid' });
    throwErr(403, `token 访问次数超出限制`);
  }

  return share;
};
/*
 * 计算分享奖励，生成科创币账单，设置分享奖励状态
 * @author pengxiguaa 2019--8-16
 * */
shareSchema.methods.computeReword = async function (type, ip, port) {
  const SettingModel = mongoose.model('settings');
  const { share } = await SettingModel.getSettings('redEnvelope');
  const ShareModel = mongoose.model('share');
  const UserModel = mongoose.model('users');
  const shareSettings = await SettingModel.getSettings('share');
  const { translate } = require('../nkcModules/translate');
  const { languageNames } = require('../nkcModules/language');
  let { today } = require('../nkcModules/apiFunction');
  today = today();
  const {
    token,
    uid,
    tokenLife,
    tokenType,
    targetId,
    kcbTotal,
    registerKcbTotal,
    shareReward,
    registerReward,
  } = this;
  let clickReward = true,
    createUserReward = true;
  if (!uid || uid === 'visitor') {
    clickReward = false;
    createUserReward = false;
  }
  const typeSettings = shareSettings[tokenType];
  const registerSettings = share.register;
  if (!typeSettings.rewardStatus) {
    clickReward = false;
  }
  if (!registerSettings.status) {
    createUserReward = false;
  }
  if (!shareReward) {
    clickReward = false;
  }
  if (!registerReward) {
    createUserReward = false;
  }
  if (tokenLife !== 'effective') {
    clickReward = false;
    createUserReward = false;
  }
  if (kcbTotal >= typeSettings.maxKcb) {
    clickReward = false;
  }
  if (registerKcbTotal >= registerSettings.maxKcb) {
    createUserReward = false;
  }
  const shares = await ShareModel.find({ toc: { $gte: today }, uid });
  let total = 0;
  for (const s of shares) {
    total += s.registerKcbTotal || 0;
  }
  // 针对注册，count字段表示的是"每天获得注册奖励的上限"
  if (total >= registerSettings.count) {
    createUserReward = false;
  }
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const updateObj = {
    shareReward: !!clickReward,
    registerReward: !!createUserReward,
  };
  let status = false;
  let num = 0;
  const shareRewardScore = await SettingModel.getScoreByOperationType(
    'shareRewardScore',
  );
  if (clickReward && type === 'visit') {
    const record = await KcbsRecordModel({
      _id: await SettingModel.operateSystemID('kcbsRecords', 1),
      scoreType: shareRewardScore.type,
      from: 'bank',
      to: uid,
      type: 'share',
      num: typeSettings.kcb,
      c: {
        type: tokenType,
        token: token,
        targetId: targetId,
      },
      ip,
      port,
      description: `分享${translate(languageNames.zh_cn, 'share', tokenType)}`,
    });
    await record.save();
    if (!updateObj.$inc) {
      updateObj.$inc = {};
    }
    updateObj.$inc.kcbTotal = typeSettings.kcb;
    status = true;
    num = typeSettings.kcb;
  }
  if (createUserReward && type === 'register') {
    const record = await KcbsRecordModel({
      _id: await SettingModel.operateSystemID('kcbsRecords', 1),
      from: 'bank',
      to: uid,
      scoreType: shareRewardScore.type,
      type: 'share',
      num: registerSettings.kcb,
      c: {
        type: tokenType,
        token: token,
        targetId: targetId,
      },
      ip,
      port,
      description: `分享${translate(
        languageNames.zh_cn,
        'share',
        tokenType,
      )}，完成注册`,
    });
    await record.save();
    if (!updateObj.$inc) {
      updateObj.$inc = {};
    }
    updateObj.$inc.registerKcbTotal = registerSettings.kcb;
    status = true;
    num = typeSettings.kcb;
  }
  await this.updateOne(updateObj);
  // await mongoose.model("users").updateUserKcb(uid);
  await UserModel.updateUserScores(uid);
  return {
    status,
    num,
  };
};
/*
 * 获取分享链接中的token
 * @return {String}
 * @author pengxiguaa 2020-12-14
 * */
shareSchema.statics.getNewToken = async () => {
  const apiFunction = require('../nkcModules/apiFunction');
  const ShareModel = mongoose.model('share');
  let token,
    n = 0;
  do {
    n++;
    if (n > 100) {
      throwErr(500, `分享：生成唯一token失败`);
    }
    token = apiFunction.getRandomString('a0', 8);
    const tokenCount = await ShareModel.countDocuments({ token });
    if (!tokenCount) {
      break;
    }
  } while (1);
  return token;
};

/*
 * 获取分享链接
 * */
shareSchema.methods.getShareUrl = async function () {
  const { targetId, tokenType, token, shareUrl } = this;
  const { getUrl } = require('../nkcModules/tools');
  const ArticleModel = mongoose.model('articles');
  const t = `?token=${token}`;

  switch (tokenType) {
    case shareTypes.post:
      return getUrl('postHome', targetId) + t;
    case shareTypes.thread:
      return getUrl('thread', targetId) + t;
    case shareTypes.forum:
      return getUrl('forumHome', targetId) + t;
    case shareTypes.user:
      return getUrl('userHome', targetId) + t;
    case shareTypes.column:
      return getUrl('columnHome', targetId) + t;
    case shareTypes.fund:
      return getUrl('singleFundHome', targetId) + t;
    case shareTypes.fundForm:
      return getUrl('fundApplicationForm', targetId) + t;
    case shareTypes.comment:
      return getUrl('comment', targetId) + t;
    case shareTypes.article: {
      let article = await ArticleModel.findOnly({ _id: targetId });
      article = (await ArticleModel.getArticlesInfo([article]))[0];
      return article.url + t;
    }
    case shareTypes.activity:
      return getUrl('activity', targetId) + t;
    case shareTypes.moment:
      return getUrl('zoneMoment', targetId) + t;
    default:
      return '/';
  }
};

/*
 * 获取分享类型
 * */
shareSchema.statics.getShareTypes = async function () {
  return { ...shareTypes };
};

/*
 * 获取分享数据
 * @param {String} type 分享类型 取值为 shareTypes
 * @param {String} id 分享类型对应的 ID
 * @return {Object}
 *   @param {String} title 标题
 *   @param {String} cover 封面图链接
 *   @param {String} desc 摘要
 * */
shareSchema.statics.getShareContent = async function (props) {
  const PostModel = mongoose.model('posts');
  const ForumModel = mongoose.model('forums');
  const UserModel = mongoose.model('users');
  const CommentModel = mongoose.model('comments');
  const ThreadModel = mongoose.model('threads');
  const FundModel = mongoose.model('funds');
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const ArticleModel = mongoose.model('articles');
  const MomentsModel = mongoose.model('moments');
  const SettingModel = mongoose.model('settings');
  const ColumnModel = mongoose.model('columns');
  const { getUrl } = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');

  const { type, id, userRoles, userGrade, user } = props;

  let shareContent = {
    title: '',
    cover: '',
    desc: '',
  };
  if (!Object.values(shareTypes).includes(type)) {
    throwErr(400, `未知的分享类型`);
  }
  if (type === shareTypes.post) {
    const post = await PostModel.findOnly({ pid: id });
    const thread = await post.extendThread();
    const firstPost = await thread.extendFirstPost();
    await thread.ensurePermission(userRoles, userGrade, user);
    shareContent = {
      title: firstPost.t,
      cover: getUrl('postCover', post.cover),
      desc:
        post.l === 'json'
          ? getJsonStringTextSlice(post.c, 100)
          : nkcRender.htmlToPlain(post.c, 100),
    };
  } else if (type === shareTypes.thread) {
    const thread = await ThreadModel.findOnly({ tid: id });
    await thread.ensurePermission(userRoles, userGrade, user);
    const targetPost = await PostModel.findOnly(
      { pid: thread.oc },
      {
        t: 1,
        cover: 1,
        c: 1,
        l: 1,
      },
    );
    shareContent = {
      title: targetPost.t,
      cover: getUrl('postCover', targetPost.cover),
      desc:
        targetPost.l === 'json'
          ? getJsonStringTextSlice(targetPost.c, 100)
          : nkcRender.htmlToPlain(targetPost.c, 100),
    };
  } else if (type === shareTypes.forum) {
    const forum = await ForumModel.findOnly({ fid: id });
    await forum.ensurePermission(userRoles, userGrade, user);
    shareContent = {
      title: `「专业」${forum.displayName}`,
      cover: getUrl('forumLogo', forum.cover),
      desc: forum.description,
    };
  } else if (type === shareTypes.comment) {
    let comment = await CommentModel.findOnly({ _id: id });
    comment = await CommentModel.getCommentInfo(comment);
    shareContent = {
      title: comment.articleDocument.title,
      cover: getUrl('documentCover', comment.cover),
      desc:
        comment.commentDocument.l === 'json'
          ? getJsonStringTextSlice(comment.commentDocument.content, 100)
          : nkcRender.htmlToPlain(comment.commentDocument.content, 100),
    };
  } else if (type === shareTypes.article) {
    let article = await ArticleModel.findOnly({ _id: id });
    article = (await ArticleModel.getArticlesInfo([article]))[0];
    shareContent = {
      title: article.document.title,
      cover: getUrl('documentCover', article.document.cover),
      desc:
        article.document.l === 'json'
          ? getJsonStringTextSlice(article.document.content, 100)
          : nkcRender.htmlToPlain(article.document.content, 100),
    };
  } else if (type === shareTypes.user) {
    const targetUser = await UserModel.findOnly({ uid: id });
    shareContent = {
      title: `「用户」${targetUser.username}`,
      cover: getUrl('userAvatar', targetUser.avatar),
      desc: targetUser.description,
    };
  } else if (type === shareTypes.fund) {
    const fund = await FundModel.findOnly({ _id: id });
    const fundSettings = await SettingModel.getSettings('fund');
    shareContent = {
      title: `「${fundSettings.fundName}」${fund.name}`,
      cover: getUrl('fundAvatar', fund.avatar),
      desc: fund.description.brief,
    };
  } else if (type === shareTypes.fundForm) {
    const fundSettings = await SettingModel.getSettings('fund');
    const form = await FundApplicationFormModel.findOnly({ _id: id });
    await form.extendFund();
    await form.extendProject();
    let title = '未填写标题',
      content = '未填写内容';
    if (form.project) {
      title = form.project.title;
      content = form.project.content;
      if (form.project.l === 'json') {
        content = getJsonStringText(content);
      }
    }
    shareContent = {
      title: `「${fundSettings.fundName}申请」${title}`,
      cover: getUrl('fundAvatar', form.fund.avatar),
      desc: nkcRender.htmlToPlain(content),
    };
  } else if (type === shareTypes.column) {
    const column = await ColumnModel.findOnly({ _id: Number(id) });
    shareContent = {
      title: `「专栏」${column.name}`,
      cover: getUrl('columnAvatar', column.avatar),
      desc: column.abbr,
    };
  } else if (type === shareTypes.moment) {
    const moment = await MomentsModel.findOnly({ _id: id });
    const momentsData = await MomentsModel.extendMomentsListData(
      [moment],
      user && user.uid,
    );
    const momentInfo = momentsData[0];
    shareContent = {
      title: `「电文」${momentInfo.username || ''}`,
      cover: getUrl('userAvatar', momentInfo.user.avatar),
      desc: nkcRender.htmlToPlain(momentInfo.content || '', 100),
    };
  }
  return shareContent;
};

shareSchema.statics.getShareNameByType = async function (type) {
  const { languageNames } = require('../nkcModules/language');
  const { translate } = require('../nkcModules/translate');
  return translate(languageNames.zh_cn, 'share', type);
};

module.exports = mongoose.model('share', shareSchema, 'share');
