const settings = require('../settings');
const SettingModel = require('./SettingModel');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const tools = require("../nkcModules/tools");
const messageSchema = new Schema({

  // 消息id
  _id: Number,

  // 消息类型
  ty: {
    type: 'String',
    // 用户-用户
    // 用户-房间
    // 系统-用户
    // 系统-所有人
    // 系统-房间
    // enum: ['UTU', 'UTR', 'STU', 'STE', 'STR'],
    required: true,
    index: 1
  },

  // 时间
  tc: {
    type: Date,
    default: Date.now,
    index: 1
  },

  // 消息内容
  c: {
    type: Schema.Types.Mixed,
    required: true
  },
  /*
  * 当信息类型为提醒时：
  * c: {
  *   type: String, [digestThread, digestPost, @, replyPost, replyThread, bannedThread, threadWasReturned, bannedPost, postWasReturned, recommend]
  * }
  * na 文件名称
  * id 文件id
  * type 文件类型
  *   voice 声音
  *   img 图片
  *   file 一般文件
  *   video 视频
  *
  * pid
  * type
  *   typeThread 回复帖子
  *   typePost  回复单条回复
  * */


  // 是否已阅读
  vd: {
    type: Boolean,
    default: false,
    index: 1
  },

  // 发送者或房间号
  s: {
    type: String,
    index: 1,
    default: '',
    required: function() {
      return ['UTU', 'UTR'].includes(this.ty);
    }
  },

  // 接受者或房间号
  r: {
    type: String,
    index: 1,
    default: '',
    required: function() {
      return ['STR', 'STU', 'UTU', 'UTR'].includes(this.ty);
    }
  },

  port: {
    type: Number,
    default: null
  },
  ip: {
    type: String,
    default: ''
  },

  withdrawn: {
    type: Boolean,
    default: false,
    index: 1
  }

}, {
  collection: 'messages',
  toObject: {
    getters: true,
    virtuals: true
  }
});
/*
* 根据用户的文章、回复的数量以及目标用户的等级判断用户是否能够发送短消息
* @param {String} uid 发送者ID
* @param {String} tUid 接受者ID
* @author pengxiguaa 2021-06-22
* @return {String|null} 限制时的说明 null表示不限制
* */
messageSchema.statics.getSystemLimitInfo = async (uid, tUid) => {
  const SettingModel = mongoose.model("settings");
  const ThreadModel = mongoose.model("threads");
  const UserModel = mongoose.model("users");
  const PostModel = mongoose.model("posts");
  const messageSettings = await SettingModel.getSettings("message");
  const {mandatoryLimitInfo, mandatoryLimit, adminRolesId, mandatoryLimitGradeProtect} = messageSettings;

  const limitInfo = mandatoryLimitInfo;

  const notLimitInfo = null;

  const targetUser = await UserModel.findOnly({uid: tUid});
  // 判断用户是否正在售卖商品且勾选在售卖商品时允许任何人向自己发送消息
  const allowAllMessage = await UserModel.allowAllMessage(targetUser.uid);
  if(allowAllMessage) return notLimitInfo;

  await targetUser.extendGrade();
  // 处于等级黑名单的目标用户不受保护
  if(mandatoryLimitGradeProtect.includes(targetUser.grade._id)) return notLimitInfo;
  // 指定证书的管理员可收到任何人的消息
  for(const cert of targetUser.certs) {
    if(adminRolesId.includes(cert)) return notLimitInfo;
  }
  const recycleId = await SettingModel.getRecycleId();
  const {threadCount, postCount} = mandatoryLimit;
  const userThreadCount = await ThreadModel.countDocuments({
    uid,
    reviewed: true,
    disabled: false,
    recycleMark: {$ne: true},
    mainForumsId: {$ne: recycleId}
  });
  if(userThreadCount < threadCount) {
    return limitInfo;
  }
  const userPostCount = await PostModel.countDocuments({
    uid,
    reviewed: true,
    disabled: false,
    toDraft: {$ne: true},
    mainForumsId: {$ne: recycleId}
  });
  if(userPostCount < postCount) {
    return limitInfo;
  }
  return notLimitInfo;
};

/*
* 获取用户短消息条数限制
* @param {String} uid 当前用户
* @param {String} tUid 目标用户
* @return {String|null} 受限时的说明 null表示不限制
* */
messageSchema.statics.getMessageCountLimitInfo = async (uid, tUid) => {
  const UserModel = mongoose.model('users');
  const MessageModel = mongoose.model('messages');
  const apiFunction = require('../nkcModules/apiFunction');
  const user = await UserModel.findOnly({uid});
  const {messageCountLimit, messagePersonCountLimit} = await user.getMessageLimit();
  const today = apiFunction.today();

  // 消息管理员无需权限判断
  const messageCount = await MessageModel.countDocuments({
    s: user.uid,
    ty: 'UTU',
    tc: {
      $gte: today
    }
  });
  if(messageCount >= messageCountLimit) {
    return `根据你的证书和等级，你每天最多只能发送${messageCountLimit}条信息`;
  }
  let todayUid = await MessageModel.aggregate([
    {
      $match: {
        s: user.uid,
        ty: 'UTU',
        tc: {
          $gte: today
        }
      }
    },
    {
      $group: {
        _id: '$r'
      }
    }
  ]);
  todayUid = todayUid.map(o => o._id);
  if(!todayUid.includes(tUid)) {
    if(todayUid.length >= messagePersonCountLimit) {
      return `根据你的证书和等级，你每天最多只能给${messagePersonCountLimit}个用户发送信息`;
    }
  }
  return null;
};

/*
  判断用户是否有权给某个用户发送短消息 根据黑白名单以及目标用户的防骚扰设置来判断
  @param uid 当前用户ID
  @param tUid 目标用户ID
  @author pengxiguaa 2021-6-22
  @return {String|null} 受限时的说明 null表示不限制
*/
messageSchema.statics.getUserLimitInfo = async (uid, tUid) => {
  const UserModel = mongoose.model('users');
  const SettingModel = mongoose.model("settings");
  const FriendModel = mongoose.model('friends');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const BlacklistModel = mongoose.model("blacklists");
  const ThreadModel = mongoose.model("threads");
  const user = await UserModel.findOnly({uid: uid});
  const targetUser = await UserModel.findOnly({uid: tUid});

  const notLimitInfo = null;

  const allowAllMessage = await UserModel.allowAllMessage(targetUser.uid);

  if(allowAllMessage) return notLimitInfo;

  // 黑名单判断
  let blackList = await BlacklistModel.findOne({
    uid: uid,
    tUid: tUid
  });
  if(blackList) {
    return "你已将对方加入黑名单，无法发送消息。";
  }
  blackList = await BlacklistModel.findOne({
    uid: tUid,
    tUid: uid
  });
  if(blackList) {
    return "你在对方的黑名单中，对方可能不希望与你交流。";
  }

  // 好友间发消息无需防骚扰判断
  const friendRelationship = await FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
  if(friendRelationship) return notLimitInfo;

  // 系统防骚扰
  const {customizeLimitInfo} = await SettingModel.getSettings('message');
  const userGeneral = await UsersGeneralModel.findOnly({uid: targetUser.uid});
  const {status, timeLimit, digestLimit, xsfLimit, gradeLimit, volumeA, volumeB} = userGeneral.messageSettings.limit;
  const limitInfo = customizeLimitInfo;
  // 如果用户开启了自定义防骚扰
  if(status) {
    // 注册时间大于30天
    if(timeLimit && user.toc > Date.now() - 30*24*60*60*1000) return limitInfo;
    // 有加入精选的文章
    if(digestLimit) {
      const count = await ThreadModel.countDocuments({
        digest: true,
        uid: user.uid
      });
      if(count === 0) return limitInfo;
    }
    // 有学术分
    if(xsfLimit && user.xsf <= 0) return limitInfo;
    // 是否通过相应考试。通过B卷默认通过A卷。
    if(volumeB) {
      if(!user.volumeB) return limitInfo;
    } else if(volumeA) {
      if(!user.volumeA) return limitInfo;
    }
    if(!user.grade) await user.extendGrade();
    // 达到一定等级
    if(Number(gradeLimit) > Number(user.grade._id)) return limitInfo;
  }
  return notLimitInfo;
};

/*
* 判断在发送消息时是否显示系统警告信息
* @param {String} uid 当前用户
* @param {String} tUid 目标用户
* @return {String|null} 警告内容 null表示不显示警告
* */
messageSchema.statics.getSystemWarningInfo = async (uid, tUid) => {
  const UserModel = mongoose.model('users');
  const SettingModel = mongoose.model('settings');
  const user = await UserModel.findOnly({uid});
  const targetUser = await UserModel.findOnly({uid: tUid});
  const {
    gradeLimit,
    gradeProtect,
    systemLimitInfo
  } = await SettingModel.getSettings('message');
  await user.extendGrade();
  await targetUser.extendGrade();
  if(
    gradeLimit.includes(user.grade._id) ||
    gradeProtect.includes(targetUser.grade._id)
  ) {
    return systemLimitInfo;
  } else {
    return null;
  }
};

/*
* 拓展应用通知信息，拓展参数字段
* @param {Object} message STU类message
* */
messageSchema.statics.getParametersData = async (message) => {
  const moment = require("moment");
  const PostModel = mongoose.model("posts");
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const FundApplicationFormModel = mongoose.model("fundApplicationForms");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const ColumnModel = mongoose.model("columns");
  const LibraryModel = mongoose.model('libraries');
  const ShopRefundModel = mongoose.model("shopRefunds");
  const ActivityModel = mongoose.model("activity");
  const ComplaintModel = mongoose.model('complaints');
  const SettingModel= mongoose.model('settings');
  const ProblemModel = mongoose.model("problems");
  const PostsVoteModel = mongoose.model('postsVotes');
  const SecurityApplicationModel = mongoose.model('securityApplications');
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const ForumModel = mongoose.model('forums');
  const PreparationForumModel = mongoose.model('pForum');
  const apiFunction = require("../nkcModules/apiFunction");
  const {getUrl, getAnonymousInfo} = require('../nkcModules/tools');
  const timeout = 72 * 60 * 60 * 1000;
  let parameters = {};
  const {type} = message.c;
  if(type === 'at') {
    const {targetPid, targetUid} = message.c;
    const post = await PostModel.findOne({pid: targetPid}, {pid: 1, tid: 1, c: 1, uid: 1});
    if (!post) return null;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if (!thread) return null;
    const firstPost = await thread.extendFirstPost();
    let user = {};
    if(post.anonymous) {
      user = getAnonymousInfo();
    } else {
      user = await UserModel.findOne({uid: targetUid});
      if (!user) return null;
    }
    parameters = {
      threadURL: getUrl('thread', thread.tid),
      threadTitle: firstPost.t,
      postURL: await PostModel.getUrl(post),
      username: user.username,
      userURL: user.uid? getUrl('userHome', user.uid): ''
    };
  } else if(type === 'xsf') {
    const {pid, num} = message.c;
    const post = await PostModel.findOne({pid});
    if(!post) return null;
    parameters = {
      postURL: await PostModel.getUrl(post),
      xsfCount: num
    };
  } else if(type === 'scoreTransfer') {
    const {pid, uid, scoreType, number} = message.c;
    const post = await PostModel.findOne({pid});
    if(!post) return null;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    const user = await UserModel.findOne({uid});
    if(!user) return null;
    let scoreConfig = await SettingModel.getScoreByScoreType(scoreType);
    const scoreName = scoreConfig.name;
    const scoreNumber = number / 100;
    parameters = {
      username: user.username,
      postURL: await PostModel.getUrl(post),
      threadTitle: firstPost.t,
      scoreNumber,
      scoreName,
    };
  } else if(type === 'digestPost') {
    const {pid} = message.c;
    const post = await PostModel.findOne({pid});
    if(!post) return null;
    parameters = {
      postURL: await PostModel.getUrl(post)
    };
  } else if(type === 'digestThread') {
    const {pid} = message.c;
    const post = await PostModel.findOne({pid})
    if(!post) return null;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    parameters = {
      threadTitle: firstPost.t,
      threadURL: getUrl('thread', thread.tid)
    };
  } else if(type === 'bannedThread') {
    const {tid, rea} = message.c;
    const thread = await ThreadModel.findOne({tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    parameters = {
      threadTitle: firstPost.t,
      threadURL: getUrl('thread', thread.tid),
      reason: rea
    };
  } else if(type === 'bannedPost') {
    const {pid, rea} = message.c;
    const post = await PostModel.findOne({pid});
    if(!post) return null;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    parameters = {
      threadTitle: firstPost.t,
      threadURL: getUrl('thread', thread.tid),
      reason: rea
    };
  } else if(type === 'threadWasReturned') {
    const {tid, rea} = message.c;
    const thread = await ThreadModel.findOne({tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    parameters = {
      threadTitle: firstPost.t,
      threadURL: getUrl('thread', thread.tid),
      editThreadURL: `/editor?type=post&id=${thread.oc}`,
      reason: rea,
      deadline: moment(Date.now() + timeout).format("YYYY-MM-DD HH:mm:ss")
    };
  } else if(type === 'postWasReturned') {
    const {pid, rea} = message.c;
    const post = await PostModel.findOne({pid});
    if (!post) return null;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if (!thread) return null;
    const firstPost = await thread.extendFirstPost();
    parameters = {
      threadTitle: firstPost.t,
      threadURL: getUrl('thread', thread.tid),
      editPostURL: `/editor?type=post&id=${post.pid}`,
      reason: rea,
      deadline: moment(Date.now() + timeout).format("YYYY-MM-DD HH:mm:ss")
    };
  } else if(type === 'moveThread') {
    const {tid, rea, forumsId, threadCategoriesId = []} = message.c;
    const thread = await ThreadModel.findOne({tid});
    if(!thread) return null;
    const threadCategories = await ThreadCategoryModel.getCategoriesById(threadCategoriesId);
    const firstPost = await thread.extendFirstPost();
    let forumsName = '';
    if(forumsId && forumsId.length > 0) {
      const forums = await ForumModel.find({fid: {$in: forumsId}}, {
        displayName: 1,
        fid: 1
      });
      forumsName = forums.map(f => f.displayName).join('、');
    }
    let threadCategoriesName = threadCategories.map(tc => {
      return `${tc.categoryName} - ${tc.nodeName}`
    });
    parameters = {
      threadTitle: firstPost.t,
      threadURL: getUrl('thread', thread.tid),
      reason: rea,
      forumsName: forumsName || '空',
      threadCategoriesName: threadCategoriesName.join(`、`) || '空'
    }
  } else if(type === 'replyPost') {
    const {targetPid} = message.c;
    const post = await PostModel.findOne({pid: targetPid});
    if(!post) return null;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    let user = {};
    if(post.anonymous) {
      user = getAnonymousInfo();
    } else {
      user = await UserModel.findOne({uid: post.uid});
      if(!user) return null;
    }
    parameters = {
      userURL: user.uid? getUrl('userHome', user.uid): '',
      username: user.username,
      threadURL: getUrl('thread', thread.tid),
      threadTitle: firstPost.t,
      postURL: await PostModel.getUrl(post),
      postContent: apiFunction.obtainPureText(post.c)
    };
  } else if(type === 'replyThread') {
    const {targetPid} = message.c;
    const post = await PostModel.findOne({pid: targetPid});
    if(!post) return null;
    let user = {};
    if(post.anonymous) {
      user = getAnonymousInfo();
    } else {
      user = await UserModel.findOne({uid: post.uid});
      if(!user) return null;
    }
    const thread = await ThreadModel.findOne({tid: post.tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    parameters = {
      userURL: user.uid? getUrl('userHome', user.uid): '',
      username: user.username,
      threadURL: getUrl('thread', thread.tid),
      threadTitle: firstPost.t,
      postURL: await PostModel.getUrl(post),
      postContent: apiFunction.obtainPureText(post.c)
    };
  } else if(type === 'comment') {
    const {pid} = message.c;
    const post = await PostModel.findOne({pid});
    if(!post) return null;
    let user = {};
    if(post.anonymous) {
      user = getAnonymousInfo();
    } else {
      user = await UserModel.findOne({uid: post.uid});
      if(!user) return null;
    }
    parameters = {
      postURL: await PostModel.getUrl(post),
      postContent: apiFunction.obtainPureText(post.c),
      userURL: user.uid? getUrl('userHome', user.uid): '',
      username: user.username
    };
  } else if(type === 'userAuthApply') {
    const {targetUid} =  message.c;
    const user = await UserModel.findOne({uid: targetUid});
    if(!user) return null;
    parameters = {
      username: user.username,
      userAuthApplyURL: `/u/${user.uid}/auth`
    };
  } else if(type === 'shopSellerNewOrder') {
    const {orderId} = message.c;
    const order = await ShopOrdersModel.findOne({orderId: orderId});
    if(!order) return null;
    parameters = {
      orderID: order.orderId,
      sellerOrderListURL: `/shop/manage/order`
    };
  } else if(type === 'shopBuyerOrderChange') {
    const {orderId} = message.c;
    const order = await ShopOrdersModel.findOne({orderId});
    if(!order) return null;
    parameters = {
      orderID: order.orderId,
      buyerOrderURL: `/shop/order/${order.orderId}/detail`
    };
  } else if(type === 'problemFixed') {
    const {pid} = message.c;
    const problem = await ProblemModel.findOne({_id: pid});
    if(!problem) return null;
    const restorer = await UserModel.findOne({uid: problem.restorerId});
    if(!restorer) return null;
    parameters = {
      problemTitle: problem.t,
      restorerURL: getUrl('userHome', restorer.uid),
      restorerName: restorer.username,
      problemURL: `/u/${problem.uid}/myProblems/${problem._id}`
    };
  } else if(
    [
      "shopBuyerOrderChange",
      "shopSellerNewOrder",
      "shopBuyerPay",
      "shopBuyerConfirmReceipt",
      "shopSellerShip",
      "shopSellerCancelOrder",
      "shopBuyerApplyRefund",
      "shopBuyerRefundChange",
      "shopSellerRefundChange",
    ].includes(type)
  ) {
    const {r} = message;
    const {orderId, refundId} = message.c;
    let order, refund;
    if(orderId) {
      order = await ShopOrdersModel.findOne({orderId});
      if(!order) return null;
    }
    if(refundId) {
      refund = await ShopRefundModel.findOne({_id: refundId});
    }
    const user = await UserModel.findOne({uid: r});
    if(!user) return null;

    if(type === 'shopBuyerOrderChange') {
      parameters = {
        orderID: order.orderId,
        buyerOrderURL: `/shop/order/${order.orderId}/detail`
      };
    } else if(type === 'shopSellerNewOrder') {
      parameters = {
        orderID: order.orderId,
        sellerOrderListURL: `/shop/manage/order`
      };
    } else if(type === 'shopBuyerPay') {
      parameters = {
        orderID: order.orderId,
        sellerOrderURL: `/shop/manage/${user.uid}/order/detail?orderId=${order.orderId}`
      };
    } else if(type === 'shopBuyerConfirmReceipt') {
      parameters = {
        orderID: order.orderId,
        sellerOrderURL: `/shop/manage/${user.uid}/order/detail?orderId=${order.orderId}`
      };
    } else if(type === 'shopSellerShip') {
      parameters = {
        orderID: order.orderId,
        buyerOrderURL: `/shop/order/${order.orderId}/detail`
      };
    } else if(type === 'shopSellerCancelOrder') {
      parameters = {
        orderID: order.orderId,
        buyerOrderURL: `/shop/order/${order.orderId}/detail`
      };
    } else if(type === 'shopBuyerApplyRefund') {
      parameters = {
        orderID: order.orderId,
        sellerOrderRefundURL: `/shop/manage/${user.uid}/order/refund?orderId=${order.orderId}`
      };
    } else if(type === 'shopBuyerRefundChange') {
      parameters = {
        orderID: order.orderId,
        buyerOrderRefundURL: `/shop/order/${order.orderId}/refund`
      };
    } else if(type === 'shopSellerRefundChange') {
      parameters = {
        orderID: order.orderId,
        sellerOrderRefundURL: `/shop/manage/${user.uid}/order/refund?orderId=${order.orderId}`
      };
    }
  } else if(['warningPost', 'warningThread'].includes(type)) {
    const {pid, rea} = message.c;
    const post = await PostModel.findOne({pid});
    if(!post) return null;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if(!thread) return null;
    const firstPost = await thread.extendFirstPost();
    parameters = {
      threadURL: getUrl('thread', thread.tid),
      threadTitle: firstPost.t,
      reason: rea,
    }
    if(type === 'warningPost') {
      parameters.postURL = await PostModel.getUrl(post);
      parameters.editPostURL = `/editor?type=post&id=${post.pid}`;
    } else if(type === 'warningThread') {
      parameters.editThreadURL = `/editor?type=post&id=${thread.oc}`
    }
  } else if(type === 'activityChangeNotice') {
    const {acid, content, cTitle} = message.c;
    const activity = await ActivityModel.findOne({acid});
    if(!activity) return null;
    parameters = {
      activityUrl: `/activity/single/${activity.acid}`,
      activityTitle: activity.activityTitle,
      noticeContent: content,
      cTitle: cTitle,
    };
  } else if(["newReview", "passReview"].includes(type)) {
    const {pid} = message.c;
    const post = await PostModel.findOne({pid});
    if(!post) return null;
    parameters = {
      reviewLink: await PostModel.getUrl(post)
    };
  } else if(["fundAdmin", "fundApplicant", "fundMember", "fundFinishProject"].includes(type)) {
    const {applicationFormId} = message.c;
    let applicationForm = await FundApplicationFormModel.findOne({_id: applicationFormId});
    if(!applicationForm) return null;
    applicationForm = applicationForm.toObject();
    const user = await UserModel.findOne({uid: applicationForm.uid});
    if(!user) return null;
    applicationForm.url = `/fund/a/${applicationForm._id}`;
    parameters = {
      applicationFormURL: `/fund/a/${applicationForm._id}`,
      applicationFormCode: applicationForm.code,
    };
    if(type === 'fundMember') {
      parameters.username = user.username;
      parameters.userURL = getUrl('userHome', user.uid);
    }
  } else if([
    "newColumnContribute", "columnContributeChange",
    "disabledColumn", "disabledColumnInfo",
    "columnContactAdmin"
  ].includes(type)) {
    const {columnId, rea} = message.c;
    const column = await ColumnModel.findOne({_id: columnId});
    if(!column) return null;
    if(type === 'newColumnContribute') {
      parameters = {
        columnContributeURL: `/m/${column._id}/settings/contribute`,
        columnURL: `/m/${column._id}`,
        columnName: column.name
      };
    } else if(type === 'columnContributeChange') {
      parameters = {
        userContributeURL: `/account/contribute`,
        columnURL: `/m/${column._id}`,
        columnName: column.name
      };
    } else if(type === 'disabledColumn') {
      parameters = {
        columnURL: `/m/${column._id}`,
        columnName: column.name,
        reason: rea,
      };
    } else if(type === 'disabledColumnInfo') {
      parameters = {
        columnURL: `/m/${column._id}`,
        columnName: column.name,
        reason: rea,
        columnInfoType: ({
          'notice': '公告通知',
          'otherLinks': '友情链接',
          'blocks': '自定义内容',
          'name': '专栏名',
          'abbr': '专栏简介',
          'logo': 'logo',
          'banner': 'banner'
        })[c.columnInfoType]
      };
    } else if(type === 'columnContactAdmin') {
      parameters = {
        columnURL: `/m/${column._id}`,
        columnName: column.name,
      };
    }
  } else if(type === 'latestVotes') {
    let {votesId} = message.c;
    votesId = votesId.map(v => {
      return mongoose.Types.ObjectId(v);
    });
    const votes = await PostsVoteModel.find({_id: {$in: votesId}}, {
      pid: 1, uid: 1
    });
    if(!votes.length) return null;
    const usersId = [];
    let pid = '';
    votes.map(v => {
      usersId.push(v.uid);
      pid = v.pid;
    });
    const users = await UserModel.find({uid: {$in: usersId}}, {username: 1});
    if(!users.length) return null;
    const usernames = users.map(user => user.username);
    parameters = {
      LVUsernames: usernames.slice(0, 6).join("、"),
      LVTotal: usersId.length
    };
    // 目标post
    const post = await PostModel.findOne({pid}, {type: 1, tid: 1, t: 1, pid});
    if(!post) return null;
    // 如果是文章
    if(post.type === "thread") {
      parameters.LVTarget = getUrl('thread', post.tid);
      parameters.LVTargetDesc = `文章《${post.t}》`;
    } else if(post.type === "post") {
      parameters.LVTarget = await PostModel.getUrl(post);
      parameters.LVTargetDesc = `回复(点击查看)`;
    }
  } else if(type === 'complaintsResolve') {
    // 投诉类型
    const {complaintId} = message.c;
    const complaint = await ComplaintModel.findOne({_id: complaintId});
    if(!complaint || !complaint.resolved || !complaint.informed) return null;
    const {type: complaintType, contentId, result, reasonDescription} = complaint;
    let CRType, CRTarget, CRTargetDesc;
    if(complaintType === "thread") {
      CRType = "文章";
      // 投诉目标链接
      CRTarget = tools.getUrl("thread", contentId)
      // 投诉目标描述
      const thread = await ThreadModel.findOne({tid: contentId});
      if(!thread) return null;
      const firstPost = await thread.extendFirstPost();
      CRTargetDesc = `《${firstPost.t}》`;
    } else if(complaintType === "user") {
      CRType = "用户";
      // 投诉目标链接
      CRTarget = tools.getUrl("userHome", contentId);
      // 投诉目标描述
      const user = await UserModel.findOne({uid: contentId}, {username: 1});
      if(!user) return null;
      CRTargetDesc = user.username;
    } else if(complaintType === "post") {
      CRType = "回复";
      // 投诉目标链接
      CRTarget = tools.getUrl("post", contentId);
      // 投诉目标描述
      CRTargetDesc = "点击查看";
    }else if(complaintType === "library"){
      CRType = "文库文件";
      // 投诉目标链接
      const library = await LibraryModel.findOne({_id: contentId});
      if(!library) return null;
      const nav = await library.getNav();
      const topFolderId = nav[0]._id;
      const forum = await ForumModel.findOne({lid: topFolderId});
      if(!forum) return null;
      let folderId;
      folderId = nav.slice(-1)[0].lid;
      CRTarget = `/f/${forum.fid}/library#${folderId}`;
      // CRTarget = tools.getUrl("library", contentId);
      // 投诉目标描述
      CRTargetDesc = library.name;
    } else {
      return null;
    }
    parameters = {
      CRReason: reasonDescription,
      CRResult: result,
      CRType,
      CRTarget,
      CRTargetDesc
    };
  } else if(type === 'newForumReview') {
    let {pfid} = message.c;
    let pForum = await PreparationForumModel.findOne({pfid});
    if(!pForum) return null;
    let { uid, info } = pForum;
    let { newForumName } = info;
    const user = await UserModel.findOne({uid}, {username: 1});
    if(!user) return null;
    parameters = {
      NFRUserProfile: tools.getUrl("userHome", uid),
      NFRUserName: user.username,
      NFRName: newForumName,
      NFRReview: "/nkc/applyForum"
    };
  } else if(type === 'inviteFounder') {
    let { pfid, myUid } = message.c;
    let pForum = await PreparationForumModel.findOne({pfid});
    if(!pForum) return null;
    let { uid, info } = pForum;
    let { newForumName } = info;
    const user = await UserModel.findOne({uid}, {username: 1});
    if(!user) return null;
    parameters = {
      IFUserProfile: tools.getUrl("userHome", uid),
      IFUserName: user.username,
      IFName: newForumName,
      IFAcceptPageUrl: `/u/${r.r}/forum/invitation?pfid=${pfid}`
    };
  } else if(type === 'newForumReviewResolve') {
    let { pfid, fid } = message.c;
    let forum = await ForumModel.findOne({fid});
    let pForum = await PreparationForumModel.findOne({pfid});
    if(!forum) return null;
    let { displayName } = forum;
    // 专业名
    parameters = {
      NFRSName: displayName,
      NFRSUrl: tools.getUrl("forumHome", fid),
      NFRSExpired: tools.timeFormat(pForum.expired)
    };
  } else if(type === 'newForumReviewReject') {
    let { pfid } = message.c;
    let pForum = await PreparationForumModel.findOne({pfid});
    if(!pForum) return null;
    let { info } = pForum;
    let { newForumName } = info;
    parameters = {
      NFRJName: newForumName,
    };
  } else if(type === 'becomeFormalForum') {
    let { name, formal } = message.c;
    parameters = {
      BFFName: name,
    };
    if(formal) {
      parameters.BFFMessage = "已转为正式专业";
    } else {
      parameters.BFFMessage = "已被关停，此筹备专业未能在30天内产出50篇文章";
    }
  }
   else if([
    'securityApplicationRejected',
    'securityApplicationResolved'
  ].includes(type)) {
    const {securityApplicationId} = message.c;
    const application = await SecurityApplicationModel.findOne({_id: securityApplicationId});
    if(!application) return null;
    parameters = {
      reason: application.reason
    };
  } else if(type === 'violation') {
     const {threadId, rea}= message.c;
     const thread = await ThreadModel.findOne({tid: threadId});
     if(!thread) return null;
     const firstPost = await thread.extendFirstPost();
     parameters = {
       threadTitle: firstPost.t,
       threadUrl: getUrl(`thread`, thread.tid),
       reason: rea,
     };
  }
  return parameters;
};

/*
* 发送应用提醒
* @param {Object} options 参数
*   type(String): 应用提醒类型
*   rUid(String): 接受者ID
*   orderId(String): 订单ID
*   refundId(String): 退款申请ID
* @author pengxiguaa 2019-5-27
* */
messageSchema.statics.sendShopMessage = async (options) => {
  const {type, r, orderId, refundId} = options;
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const socket = require('../nkcModules/socket');
  const message = MessageModel({
    _id: await SettingModel.operateSystemID("messages", 1),
    r,
    ty: "STU",
    c: {
      type,
      orderId,
      refundId
    }
  });
  await message.save();
  await socket.sendMessageToUser(message._id);
};

/**
 * 发送新办专业申请审核
 */
messageSchema.statics.sendNewForumReviewMessage = async ({uid, pfid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const socket = require('../nkcModules/socket');
  const message = MessageModel({
    _id: await SettingModel.operateSystemID("messages", 1),
    r: uid,
    ty: "STU",
    c: {
      type: "newForumReview",
      pfid
    }
  });
  await message.save();
  await socket.sendMessageToUser(message._id);
}

/**
 * 发送新专业创始人邀请
 */
messageSchema.statics.sendInviteFounder = async ({pfid, targetUid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const socket = require('../nkcModules/socket');
  const message = MessageModel({
    _id: await SettingModel.operateSystemID("messages", 1),
    r: targetUid,
    ty: "STU",
    c: {
      type: "inviteFounder",
      pfid
    }
  });
  await message.save();
  await socket.sendMessageToUser(message._id);
}

/**
 * 发送新专业申请审核通过消息
 */
messageSchema.statics.sendNewForumReviewResolve = async ({pfid, fid, targetUid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const socket = require('../nkcModules/socket');
  const message = MessageModel({
    _id: await SettingModel.operateSystemID("messages", 1),
    r: targetUid,
    ty: "STU",
    c: {
      type: "newForumReviewResolve",
      fid,
      pfid
    }
  });
  await message.save();
  await socket.sendMessageToUser(message._id);
}

/**
 * 发送新专业申请审核不通过消息
 */
messageSchema.statics.sendNewForumReviewReject = async ({pfid, targetUid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const socket = require('../nkcModules/socket');
  const message = MessageModel({
    _id: await SettingModel.operateSystemID("messages", 1),
    r: targetUid,
    ty: "STU",
    c: {
      type: "newForumReviewReject",
      pfid
    }
  });
  await message.save();
  await socket.sendMessageToUser(message._id);
}

/**
 * 发送筹备专业转正或者关闭消息
 */
messageSchema.statics.sendBecomeFormalForum = async ({pfid, targetUid, formal}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const PreparationForumModel   = mongoose.model("pForum");
  const socket = require('../nkcModules/socket');
  const pForum = await PreparationForumModel.findOne({pfid});
  const message = MessageModel({
    _id: await SettingModel.operateSystemID("messages", 1),
    r: targetUid,
    ty: "STU",
    c: {
      type: "becomeFormalForum",
      name: pForum.info.newForumName,
      formal
    }
  });
  await message.save();
  await socket.sendMessageToUser(message._id);
}

/*
* 获取自己存在于对方的对话列表时，对方的UID
* 获取自己好友的UID
* @param {String} uid
* @return {[String]}
* */
messageSchema.statics.getUsersFriendsUid = async (uid) => {
  const CreatedChatModel = mongoose.model('createdChat');
  const FriendModel = mongoose.model('friends');
  const uids = new Set();
  const chat = await CreatedChatModel.find({uid}).sort({tlm: -1});
  chat.map(c => {
    uids.add(c.tUid);
  });
  const friends = await FriendModel.find({uid});
  friends.map(c => {
    uids.add(c.tUid);
  });
  return [...uids];
};
/*
* 打开相应页面后，将对应的提醒标记为已读状态。
* @param {Object} options
*   type {String} 打开的页面类型
*   oc {String} 文章页内容id
*   uid {String} 内容的作者
* @author pengxiguaa 2019-5-29
* */
messageSchema.statics.clearMessageSTU = async (options) => {
  const MessageModel = mongoose.model("messages");
  const {type, oc, uid} = options;
  if(type === "thread") {
    await MessageModel.updateMany({
      r: uid,
      ty: "STU",
      "c.type": "replyThread",
      "c.pid": oc
    }, {
      $set: {
        vd: true
      }
    });
  }
};


/*
* 给相应审核人员发送内容审核通知
*
* */

messageSchema.statics.sendReviewMessage = async (pid) => {
  if(!pid) throwErr(500, "pid不能为空");
  const SettingModel = mongoose.model("settings");
  const MessageModel = mongoose.model("messages");
  const socket = require('../nkcModules/socket');
  let reviewSettings = await SettingModel.findById("review");
  reviewSettings = reviewSettings.c;
  const users = await mongoose.model("users").find({certs: {$in: reviewSettings.certsId}}, {uid:1});
  for(const user of users) {
    const message = MessageModel({
      _id: await SettingModel.operateSystemID("messages", 1),
      r: user.uid,
      ty: "STU",
      c: {
        type: "newReview",
        pid
      }
    });
    await message.save();
    await socket.sendMessageToUser(message._id);
  }
};

/*
* 给基金申请超时未结题的用户发送应用提醒，利用通过审核的时间、项目周期以及当前时间判断是否需要发送应用提醒
* */
messageSchema.statics.sendFinishProject = async () =>{
  const SettingModel = mongoose.model("settings");
  const FundApplicationFormModel = mongoose.model("fundApplicationForms");
  const MessageModel = mongoose.model("messages");
  const socket = require('../nkcModules/socket');
  //获取审核成功并且超时未发送过结题提醒的数据
  const forms = await FundApplicationFormModel.find({
    reminded: false,
    "status.adminSupport": true,
    "status.completed": {$ne: true},
    useless: null,
    disabled: false
  });
  for(const i of forms){
    const finishTime = i.timeToPassed.valueOf() + i.projectCycle * 24 * 60 * 60 *1000;
    const nowTime = Date.now();
    if(nowTime >= finishTime){
      //向该用户发送系统消息通知该用户申请的项目已经结题
      const message = MessageModel({
        _id: await SettingModel.operateSystemID('messages', 1),
        ty: 'STU',
        r: i.uid,
        c: {
          type: "fundFinishProject",
          applicationFormId: i._id,
        }
      });
      //将是否已经发送结题置为true
      await FundApplicationFormModel.updateOne({_id: i._id,}, {$set: {reminded: true}});
      //将消息保存到数据库
      await message.save();
      await socket.sendMessageToUser(message._id);
    }
  }
}

/*
* 基金通知
* */
messageSchema.statics.sendFundMessage = async (applicationFormId, type) => {
  const FundApplicationFormModel = mongoose.model("fundApplicationForms");
  const FundModel = mongoose.model("funds");
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const MessageModel = mongoose.model("messages");
  const socket = require('../nkcModules/socket');
  const form = await FundApplicationFormModel.findOnly({_id: applicationFormId});
  const fund = await FundModel.findOnly({_id: form.fundId});
  if(type === "applicant") {
    const message = MessageModel({
      _id: await SettingModel.operateSystemID("messages", 1),
      ty: "STU",
      r: form.uid,
      c: {
        type: "fundApplicant",
        applicationFormId: form._id
      }
    });
    await message.save();
    await socket.sendMessageToUser(message._id);
  } else {
    const {certs, appointed} = fund[type];
    let users = await UserModel.find({certs: {$in: certs}}, {uid: 1});
    const uids = users.map(user => user.uid);
    let appointed_ = appointed.filter(uid => !uids.includes(uid));
    const aUsers = await UserModel.find({uid: {$in: appointed_}}, {uid: 1});
    users = users.concat(aUsers);
    for(const user of users) {
      const message = MessageModel({
        _id: await SettingModel.operateSystemID("messages", 1),
        ty: "STU",
        r: user.uid,
        c: {
          type: "fundAdmin",
          applicationFormId: form._id
        }
      });
      await message.save();
      await socket.sendMessageToUser(message._id);
    }
  }
};

messageSchema.statics.extendMessage = async (message) => {
  const messages = await mongoose.model("messages").extendMessages([message]);
  for(const m of messages) {
    if(m.contentType !== 'time') {
      return m;
    }
  }
}

/*
* 渲染 应用提醒 的富文本内容
* 应用提醒的内容是根据后台模板动态生成的
* */
messageSchema.statics.getSTUMessageContent = async (message) => {
  const MessageTypeModel = mongoose.model("messageTypes");
  const MessageModel = mongoose.model('messages');
  const plainEscaper = require("../nkcModules/plainEscaper");
  const filterAllHTML = require('../nkcModules/xssFilters/filterAllHTML');
  const messageType = await MessageTypeModel.findOne({_id: 'STU'});
  const {templates} = messageType;
  const templatesObj = {};
  templates.map(t => templatesObj[t.type] = t);
  const {c} = message;
  const {type} = c;
  const template = templatesObj[type];
  let content = plainEscaper(template.content);
  const parametersData = await MessageModel.getParametersData(message);
  if(parametersData === null) {
    return null;
  }
  content = content.replace(/\[url=(.*?)\((.*?)\)]/ig, (v1, v2, v3) => {
    const url = parametersData[v2] !== undefined? parametersData[v2]: v2;
    const name = parametersData[v3] !== undefined? parametersData[v3]: v3;
    return `&nbsp;<a href="${url}" target="_blank">${filterAllHTML(name)}</a>&nbsp;`
  });
  content = content.replace(/\[text=(.*?)]/ig, (v1, v2) => {
    const text = parametersData[v2] !== undefined? parametersData[v2]: v2;
    return `&nbsp;<b>${filterAllHTML(text)}</b>&nbsp;`
  });
  return content;
}

/*
* 拓展消息对象，用于reactNativeAPP，web端调整后公用
* */
messageSchema.statics.extendMessages = async (messages) => {

  // contentType: html, file, video, voice, img, time
  // status: sent, sending, error

  const nkcRender = require("../nkcModules/nkcRender");
  const {filterAllHTML, filterMessageContent} = require('../nkcModules/xssFilters');
  const MessageModel = mongoose.model("messages");
  const MessageFileModel = mongoose.model('messageFiles');
  const {getUrl} = tools;
  const _messages = [];

  const filesId = [];
  for(const m of messages) {
    if(m.ty === 'UTU' && m.c.fileId) {
      filesId.push(m.c.fileId);
    }
  }
  const files = await MessageFileModel.find({_id: {$in: filesId}});
  const filesObj = {};
  files.map(file => filesObj[file._id] = file);

  for(let i = 0; i < messages.length; i++) {

    const m = messages[i];
    const {r, s, ty, tc, c, _id, withdrawn} = m;

    const message = {
      r,
      s,
      messageType: ty,
      time: tc,
      _id,
      status: 'sent',
    };

    if(ty === 'UTU') {
      // 用户
      if(withdrawn) {
        message.contentType = 'withdrawn';
        if(typeof c === 'string' && (Date.now() - tc.getTime()) < 2 * 60 * 1000) {
          message.content = c;
        } else {
          message.conetnt = null;
        }
      } else {
        if(typeof c === 'string') {
          message.contentType = 'html';
          message.content = c;
        } else {
          const {fileId} = c;
          const file = filesObj[fileId];
          message.contentType = file.type; // img, voice, file, video
          message.content = {
            filename: file.oname,
            fileId: file._id,
            fileUrl: getUrl('messageResource', file._id),
            fileUrlSM: getUrl(`messageResource`, file._id, `sm`),
            fileCover: getUrl('messageCover', file._id),
            fileSize: file.size,
            fileDuration: Math.round(file.duration / 1000)
          }
        }
      }
    } else if(ty === 'STE') {
      // 系统通知
      message.contentType = 'html';
      message.content = c;
    } else if(ty === 'STU') {
      message.contentType = 'html';
      message.content = await MessageModel.getSTUMessageContent(m);
      if(message.content === null) continue;
    } else if(ty === 'newFriends') {
      // 新朋友
      const {toc, username, agree, description, uid} = m;
      message.time = toc;
      message.s = m.uid;
      message.content = `
        <div class="server-message">
          用户&nbsp;
          <a href="/u/${m.uid}" target="_blank">
            ${username}
          </a>
          &nbsp;申请添加你为好友。
          </br>附加说明：${filterAllHTML(description) || '无'}
          </br>
          <div class="button-container">
          ${(() => {
            if(agree === 'null') {
              return `
                <button class="agree" onclick="window._messageFriendApplication('${uid}', 'agree')">同意</button>
                <button class="disagree" onclick="window._messageFriendApplication('${uid}', 'disagree')">拒绝</button>
                <button class="ignored" onclick="window._messageFriendApplication('${uid}', 'ignored')">忽略</button>` 
            } else if(agree === 'true') {
              return `<div class="agree">已同意</div>`
            } else if(agree === 'false') {
              return `<div class="disagree">已拒绝</div>`
            } else {
              return `<div class="ignored">已忽略</div>`
            }
          })()}
          </div>
        </div>
      `;
      message.contentType = 'html';
    }

    if(message.contentType === 'html') {
      message.content = message.content || "";
      if(['STE', 'UTU'].includes(ty)) {
        // 系统通知、用户间消息
        // 替换空格
        message.content = message.content.replace(/ /g, '&nbsp;');
        // 处理链接
        message.content = nkcRender.URLifyHTML(message.content);
        // 过滤标签 仅保留标签 a['href']
        message.content = filterMessageContent(message.content);
        // 替换换行符
        message.content = message.content.replace(/\n/g, '<br/>');
        message.content = message.content.replace(/\[f\/(.*?)]/g, function(r, v1) {
          return '<img class="message-emoji" src="/twemoji/2/svg/'+ v1 +'.svg"/>';
        });
      }
    }
    _messages.push(message);
  }

  return _messages;
};

/*
* 标记与某个用户的消息为全部已读 不包含添加好友（newFriends）
* @param {String} type UTU, STU, STE, newFriends
* @param {String} uid 自己
* @param {String} tUid 对方
* @author pengxiguaa 2021-6-3
* */
messageSchema.statics.markAsRead = async (type, uid, tUid) => {
  const MessageModel = mongoose.model("messages");
  const CreatedChatModel = mongoose.model('createdChat');
  const SystemInfoLogModel = mongoose.model('systemInfoLogs');
  const FriendsApplicationModel = mongoose.model('friendsApplications');
  if(type === "UTU") {
    await MessageModel.updateMany({
      ty: 'UTU',
      r: uid,
      s: tUid,
      vd: false
    }, {
      $set: {
        vd: true
      }
    });
    await CreatedChatModel.updateMany({uid, tUid}, {$set: {unread: 0}});
  } else if(type === 'STE') {
    const messages = await MessageModel.find({ty: 'STE'});
    const myMessage = await MessageModel.mySystemInfoMessageFilter(uid, messages);
    const systemInfoIdList = myMessage.map(({ _id }) => _id);
    const readedIdList = (await SystemInfoLogModel.find({uid}, {mid: true})).map(({ mid }) => mid);
    systemInfoIdList
      .filter(id => !readedIdList.includes(id))
      .forEach(async mid => {
        await SystemInfoLogModel({
          uid,
          mid
        }).save();
      });
  } else if(type === 'STU'){
    await MessageModel.updateMany({ty: type, r: uid, vd: false}, {$set: {vd: true}});
  } else if(type === 'newFriends') {
    /*await FriendsApplicationModel.updateMany({
      respondentId: uid,
      agree: 'null'
    }, {
      $set: {
        agree: 'ignored'
      }
    });*/
  }
}

/*
* 消息文件大小检测
* @param {File Object} file 文件对象
* @pengxiguaa 2020-9-27
* */

messageSchema.statics.checkFileSize = async (file) => {
  const SettingModel = mongoose.model('settings');
  const {getSize} = require('../nkcModules/tools');
  let {size, ext} = file;
  if(!ext) {
    const FILE = require('../nkcModules/file');
    ext = await FILE.getFileExtension(file);
  }
  const messageSettings = await SettingModel.getSettings('message');
  const {sizeLimit} = messageSettings;
  // 检查文件大小是否符合要求
  let settingSize;
  for(const s of sizeLimit.others) {
    if(s.ext === ext) {
      settingSize = s.size;
      break;
    }
  }
  if(settingSize === undefined) {
    settingSize = sizeLimit.default;
  }
  if(size <= settingSize * 1024) {}
  else {
    throwErr(400, `${ext}文件不能超过${getSize(settingSize * 1024, 1)}`);
  }
};

/*
* 获取用户的发表状态
* @param {String} uid 当前用户UID
* @param {String} tUid 目标用户UID
* @param {Boolean} canSendToEveryOne 特殊发表权限
* @return {Object}
*   @param {Boolean} canSendMessage 是否有权发送短消息
*   @param {String|null} 是否需要显示提示（警告）内容
* */
messageSchema.statics.getStatusOfSendingMessage = async (uid, tUid, canSendToEveryOne = false) => {
  const MessageModel = mongoose.model('messages');
  if(canSendToEveryOne) {
    return {
      canSendMessage: true,
      warningContent: null
    };
  }
  const systemLimitInfo = await MessageModel.getSystemLimitInfo(uid, tUid);
  if(systemLimitInfo !== null) {
    return {
      canSendMessage: false,
      warningContent: systemLimitInfo
    };
  }
  const userLimitInfo = await MessageModel.getUserLimitInfo(uid, tUid);
  if(userLimitInfo !== null) {
    return {
      canSendMessage: false,
      warningContent: userLimitInfo
    };
  }
  const messageCountLimitInfo = await MessageModel.getMessageCountLimitInfo(uid, tUid);
  if(messageCountLimitInfo) {
    return {
      canSendMessage: false,
      warningContent: messageCountLimitInfo
    };
  }
  const systemWarningInfo = await MessageModel.getSystemWarningInfo(uid, tUid);
  if(systemWarningInfo !== null) {
    return {
      canSendMessage: true,
      warningContent: systemWarningInfo
    }
  }
  return {
    canSendMessage: true,
    warningContent: null
  };
};

/**
 * 获取特定用户的系统消息
 */
messageSchema.statics.getMySystemInfoMessage = async (uid, query) => {
  const MessageModel = mongoose.model('messages');
  // 查出所有的系统消息
  let messages = await MessageModel.find({...query, ty: "STE"}).sort({tc: 1}).limit(30);
  return await MessageModel.mySystemInfoMessageFilter(uid, messages);
}

/**
 * 过滤出指定用户可查看的系统消息
 */
messageSchema.statics.mySystemInfoMessageFilter = async (uid, messages) => {
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOne({ uid });
  await user.extendRoles();
  await user.extendGrade();
  // 根据当前用户过滤掉不需要的系统消息
  return messages.filter(msg => {
    const conf = msg.c;
    // 全局广播
    if(conf.mode === "broadcast") {
      return true;
    }
    // 过滤指定用户
    if(conf.mode === "user" && conf.uids.includes(uid)) {
      return true;
    }
    // 过滤条件筛选用户
    if(conf.mode === "filter") {
      const userCerts = user.roles.map(role => role._id);
      const userGrade = user.grade._id;
      const tlv = user.tlv;
      const conditionA = (() => {
        for(cert of userCerts) {
          if(conf.roles.includes(cert)) return true;
        }
      })();
      const conditionB = conf.grades.includes(userGrade);
      const conditionC = (() => {
        const [start, end] = conf.lastVisit;
        const startDate = start ? new Date(start) : new Date(null);
        const endDate = end ? new Date(end) : new Date();
        if(tlv >= startDate && tlv < endDate) return true;
      })();
      if(conditionC && (conditionA || conditionB)) return true;
    }
    return false;
  });
}

const MessageModel = mongoose.model('messages', messageSchema);
module.exports = MessageModel;

