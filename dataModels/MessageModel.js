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
* 根据用户的文章和回复的数量判断用户是否能够发送短消息
* @param {String} uid 发送者ID
* @param {String} tUid 接受者ID
* @author pengxiguaa 2019-10-11
* */
messageSchema.statics.ensureSystemLimitPermission = async (uid, tUid) => {
  const SettingModel = mongoose.model("settings");
  const ThreadModel = mongoose.model("threads");
  const UserModel = mongoose.model("users");
  const PostModel = mongoose.model("posts");
  const recycleId = await SettingModel.getRecycleId();
  const targetUser = await UserModel.findOne({uid: tUid});
  if(!targetUser) throwErr(500, `user not found, uid: ${tUid}`);
  await targetUser.extendGrade();
  const messageSettings = await SettingModel.getSettings("message");
  const {mandatoryLimitInfo, mandatoryLimit, adminRolesId, mandatoryLimitGradeProtect} = messageSettings;
  if(mandatoryLimitGradeProtect.includes(targetUser.grade._id)) return;
  for(const cert of targetUser.certs) {
    if(adminRolesId.includes(cert)) return;
  }
  const {threadCount, postCount} = mandatoryLimit;
  const userThreadCount = await ThreadModel.count({
    uid,
    reviewed: true,
    disabled: false,
    recycleMark: {$ne: true},
    mainForumsId: {$ne: recycleId}
  });
  if(userThreadCount < threadCount) throwErr(403, mandatoryLimitInfo);
  const userPostCount = await PostModel.count({
    uid,
    reviewed: true,
    disabled: false,
    toDraft: {$ne: true},
    mainForumsId: {$ne: recycleId}
  });
  if(userPostCount < postCount) throwErr(403, mandatoryLimitInfo);
};


/*
  判断用户是否有权限发送信息
  @param fromUid 当前用户ID
  @param toUid 对方用户ID
  @parma sendToEveryOne 是否拥有”消息管理员“的权限
  @author pengxiguaa 2019/2/12
*/
messageSchema.statics.ensurePermission = async (fromUid, toUid, sendToEveryOne) => {
  const UserModel = mongoose.model('users');
  const MessageModel = mongoose.model('messages');
  const FriendModel = mongoose.model('friends');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const BlacklistModel = mongoose.model("blacklists");
  const ThreadModel = mongoose.model("threads");
  const apiFunction = require('../nkcModules/apiFunction');
  const user = await UserModel.findOnly({uid: fromUid});
  const targetUser = await UserModel.findOnly({uid: toUid});
  const {messageCountLimit, messagePersonCountLimit} = await user.getMessageLimit();
  const today = apiFunction.today();
  // 消息管理员无需权限判断
  if(sendToEveryOne) return;
  const messageCount = await MessageModel.count({
    s: user.uid,
    ty: 'UTU',
    tc: {
      $gte: today
    }
  });
  if(messageCount >= messageCountLimit) {
    throwErr(403, `根据你的证书和等级，你每天最多只能发送${messageCountLimit}条信息`);
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
  if(!todayUid.includes(toUid)) {
    if(todayUid.length >= messagePersonCountLimit) {
      throwErr(403, `根据你的证书和等级，你每天最多只能给${messagePersonCountLimit}个用户发送信息`);
    }
  }

  // 判断对方是否设置了“需要添加好友之后才能聊天” 2019-5-27 移除该设置
  /*const friendRelationship = await FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
  if(!friendRelationship && !sendToEveryOne) {
    const targetUserGeneralSettings = await UsersGeneralModel.findOnly({uid: targetUser.uid});
    const onlyReceiveFromFriends = targetUserGeneralSettings.messageSettings.onlyReceiveFromFriends;
    if(onlyReceiveFromFriends) throwErr(403, '对方设置了只接收好友的聊天信息，请先添加该用户为好友。');
  }*/

  // 黑名单判断
  let blackList = await BlacklistModel.findOne({
    uid: fromUid,
    tUid: toUid
  });
  if(blackList) throwErr(403, "你已将对方加入黑名单，无法发送消息。");
  blackList = await BlacklistModel.findOne({
    uid: toUid,
    tUid: fromUid
  });
  if(blackList) throwErr(403, "你在对方的黑名单中，对方可能不希望与你交流。");

  // 好友间发消息无需防骚扰判断
  const friendRelationship = await FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
  if(friendRelationship) return;

  // 系统防骚扰
  const messageSettings = (await mongoose.model("settings").findById("message")).c;
  const {customizeLimitInfo} = messageSettings;
  const userGeneral = await UsersGeneralModel.findOnly({uid: targetUser.uid});
  const {status, timeLimit, digestLimit, xsfLimit, gradeLimit, volumeA, volumeB} = userGeneral.messageSettings.limit;
  const throwLimitError = () => {
    throwErr(403, customizeLimitInfo);
  };
  // 如果用户开启了自定义防骚扰
  if(status) {
    // 注册时间大于30天
    if(timeLimit && user.toc > Date.now() - 30*24*60*60*1000) throwLimitError();
    // 有加入精选的文章
    if(digestLimit) {
      const count = await ThreadModel.count({
        digest: true,
        uid: user.uid
      });
      if(count === 0) throwLimitError();
    }
    // 有学术分
    if(xsfLimit && user.xsf <= 0) throwLimitError();
    // 是否通过相应考试。通过B卷默认通过A卷。
    if(volumeB) {
      if(!user.volumeB) throwLimitError();
    } else if(volumeA) {
      if(!user.volumeA) throwLimitError();
    }
    if(!user.grade) await user.extendGrade();
    // 达到一定等级
    if(Number(gradeLimit) > Number(user.grade._id)) throwLimitError();
  }

};

messageSchema.statics.extendSTUMessages = async (arr) => {
  const moment = require("moment");
  const PostModel = mongoose.model("posts");
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const FundApplicationFormModel = mongoose.model("fundApplicationForms");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const ColumnModel = mongoose.model("columns");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const ActivityModel = mongoose.model("activity");
  const MessageModel = mongoose.model("messages");
  const ComplaintModel = mongoose.model('complaints');
  const ProblemModel = mongoose.model("problems");
  const PostsVoteModel = mongoose.model('postsVotes');
  const ForumModel = mongoose.model('forums');
  const PreparationForumModel = mongoose.model('pForum');
  const apiFunction = require("../nkcModules/apiFunction");
  const results = [];

  const timeout = 72 * 60 * 60 * 1000;

  for(let r of arr) {
    r = r.toObject();
    const {type, pid, targetPid, targetUid, tid, orderId, refundId, applicationFormId, columnId, acid, messageId} = r.c;
    if(type === "at") {
      const post = await PostModel.findOne({pid: targetPid});
      if (!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if (!thread) continue;
      if(post.anonymous) {
        post.uid = "";
        post.uidlm = "";
        thread.uid = "";
      } else {
        const user = await UserModel.findOne({uid: targetUid});
        if (!user) continue;
        r.c.user = user;
      }
      r.c.post = post;
      r.c.thread = thread;
    } else if(type === "xsf") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      r.c.post = post;
    } else if(type === "scoreTransfer") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      r.c.post = post;
      let thread = await ThreadModel.findOne({tid: post.tid});
      thread = await await ThreadModel.extendThreads([thread]);
      if(!thread.length) continue;
      r.c.thread = thread[0];
      r.c.user = await UserModel.findOne({uid: r.c.uid});
      if(!r.c.user) continue;
      let scoreConfig = await SettingModel.getScoreByScoreType(r.c.scoreType);
      r.c.scoreName = scoreConfig.name;
    } else if(type === "digestPost") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      r.c.post = post;
    } else if(type === "digestThread") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      r.c.thread = thread;
    } else if(type === "bannedThread") {
      const thread = await ThreadModel.findOne({tid});
      if(!thread) continue;
      r.c.thread = thread;
    } else if(type === "bannedPost") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      r.c.post = post;
      r.c.thread = thread;
    } else if(type === "threadWasReturned") {
      const thread = await ThreadModel.findOne({tid});
      if(!thread) continue;
      r.c.thread = thread;
      r.c.deadline = moment(Date.now() + timeout).format("YYYY-MM-DD HH:mm:ss");
    } else if(type === "postWasReturned") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      r.c.post = post;
      r.c.thread = thread;
      r.c.deadline = moment(Date.now() + timeout).format("YYYY-MM-DD HH:mm:ss");
    } else if(type === "replyPost") {
      const post = await PostModel.findOne({pid: targetPid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      if(post.anonymous) {
        post.uid = "";
        post.uidlm = "";
        thread.uid = "";
      } else {
        const user = await UserModel.findOne({uid: post.uid});
        if(!user) continue;
        r.c.user = user;
      }
      r.c.thread = thread;
      r.c.post = post;
    } else if(type === "replyThread") {
      const post = await PostModel.findOne({pid: targetPid});
      if (!post) continue;
      if(post.anonymous) {
        post.uid = "";
        post.uidlm = "";
      } else {
        const user = await UserModel.findOne({uid: post.uid});
        if (!user) continue;
        r.c.user = user;
      }
      const thread = await ThreadModel.findOne({tid: post.tid});
      if (!thread) continue;
      r.c.thread = thread;
      r.c.post = post;
    } else if(type === "comment") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      if(post.anonymous) {
        post.uid = "";
        post.uidlm = "";
      } else {
        const user = await UserModel.findOne({uid: post.uid});
        if(!user) continue;
        r.c.user = user;
      }
      r.c.post = post;
    } else if(type === "userAuthApply") {
      const user = await UserModel.findOne({uid: targetUid});
      if(!user) continue;
      r.c.user = user;
    } else if(type === "shopSellerNewOrder") {
      const user = await UserModel.findOne({uid: r.r});
      if(!user) continue;
      r.c.user = user;
    } else if(type === "shopBuyerOrderChange") {
      const user = await UserModel.findOne({uid: r.r});
      if(!user) continue;
      const order = await ShopOrdersModel.findOne({orderId: r.c.orderId});
      if(!order) continue;
      r.c.order = order;
    } else if (type === "problemFixed") {
      const user = await UserModel.findOne({uid: r.r});
      if(!user) continue;
      const problem = await ProblemModel.findOne({_id: r.c.pid});
      if(!problem) continue;
      r.c.problem = problem;
      const restorer = await UserModel.findOne({uid: problem.restorerId});
      if(!restorer) continue;
      r.c.restorer = restorer
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
      let order, refund;
      if(orderId) {
        order = await ShopOrdersModel.findOne({orderId});
        if(!order) continue;
      }
      if(refundId) {
        refund = await ShopRefundModel.findOne({_id: refundId});
      }
      const user = await UserModel.findOne({uid: r.r});
      if(!user) continue;
      r.c.user = user;
      r.c.order = order;
      r.c.refund = refund;
    } else if(["warningPost", "warningThread"].includes(type)) {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      r.c.post = post;
      r.c.thread = thread;
    }else if(type === "activityChangeNotice"){
      const activity = await ActivityModel.findOne({acid: acid});
      if(!activity) continue;
      r.c.activity = activity;
    } else if(["newReview", "passReview"].includes(type)) {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      r.c.post = post;
      r.c.thread = thread;
    } else if(["fundAdmin", "fundApplicant", "fundMember"].includes(type)) {
      let applicationForm = await FundApplicationFormModel.findOne({_id: applicationFormId});
      if(!applicationForm) continue;
      applicationForm = applicationForm.toObject();
      const user = await UserModel.findOne({uid: applicationForm.uid});
      if(!user) continue;
      r.c.user = user;
      applicationForm.url = `/fund/a/${applicationForm._id}`;
      r.c.applicationForm = applicationForm;
    } else if(["newColumnContribute", "columnContributeChange",
      "disabledColumn", "disabledColumnInfo",
      "columnContactAdmin"
    ].includes(type)) {
      const column = await ColumnModel.findOne({_id: columnId});
      if(!column) continue;
      r.c.column = column;
    }

    // 最新点赞通知相关
    else if(type === "latestVotes") {
      // "LVUsernames",
      // "LVTotal",
      // "LVTarget",
      // "LVTargetDesc"
      let {votesId} = r.c;
      votesId = votesId.map(v => {
        return mongoose.Types.ObjectId(v);
      });
      const votes = await PostsVoteModel.find({_id: {$in: votesId}}, {
        pid: 1, uid: 1
      });
      if(!votes.length) continue;
      const usersId = [];
      let pid = '';
      votes.map(v => {
        usersId.push(v.uid);
        pid = v.pid;
      });
      const users = await UserModel.find({uid: {$in: usersId}}, {username: 1});
      if(!users.length) continue;
      const usernames = users.map(user => user.username);
      r.c.LVUsernames = usernames.slice(0, 6).join("、");
      r.c.LVTotal = usersId.length;
      // 目标post
      const post = await PostModel.findOne({pid}, {type: 1, tid: 1, t: 1});
      if(!post) continue;
      // 如果是文章
      if(post.type === "thread") {
        r.c.LVTarget = tools.getUrl("thread", post.tid);
        r.c.LVTargetDesc = `文章《${post.t}》`;
      } else if(post.type === "post") {
        r.c.LVTarget = tools.getUrl("post", pid);
        r.c.LVTargetDesc = `回复(点击查看)`;
      }
      // let voteIds = r.c.voteIds;
      // const PostsVoteModel = mongoose.model("postsVotes");
      // const UserModel = mongoose.model("users");
      // let votes = await PostsVoteModel.find({
      //   _id: {$in: voteIds.map(id => mongoose.Types.ObjectId(id))}
      // });
      // if(!votes.length) continue;
      // r.c.total = votes.length;
      // let users = await UserModel.find({
      //   uid: {$in: votes.map(vote => vote.uid)}
      // });
      // let usernames = users.map(user => user.username);
      // r.c.partOfUsernames = usernames.slice(0, 6).join("、");
    }

    // 投诉处理通知相关
    else if(type === "complaintsResolve") {
      // 投诉类型
      const {complaintId} = r.c;
      const complaint = await ComplaintModel.findOne({_id: complaintId});
      if(!complaint || !complaint.resolved || !complaint.informed) continue;
      const {type: complaintType, contentId, result, reasonDescription} = complaint;
      r.c.result = result;
      r.c.reasonDescription = reasonDescription;
      if(complaintType === "thread") {
        r.c.CRType = "文章";
        // 投诉目标链接
        r.c.CRTarget = tools.getUrl("thread", contentId)
        // 投诉目标描述
        const thread = await ThreadModel.findOne({tid: contentId});
        if(!thread) continue;
        const [{firstPost}] = await ThreadModel.extendThreads([thread], {firstPost: true});
        r.c.CRTargetDesc = `《${firstPost.t}》`;
      } else if(complaintType === "user") {
        r.c.CRType = "用户";
        // 投诉目标链接
        r.c.CRTarget = tools.getUrl("userHome", contentId);
        // 投诉目标描述
        const user = await UserModel.findOne({uid: contentId}, {username: 1});
        if(!user) continue;
        r.c.CRTargetDesc = user.username;
      } else if(complaintType === "post") {
        r.c.CRType = "回复";
        // 投诉目标链接
        r.c.CRTarget = tools.getUrl("post", contentId);
        // 投诉目标描述
        r.c.CRTargetDesc = "点击查看";
      } else {
        continue;
      }
    }

    // 新专业申请审核相关
    else if(type === "newForumReview") {
      let fid = r.c.fid;
      let pForum = await PreparationForumModel.findOne({fid});
      if(!pForum) {
        continue;
      }
      let { uid, info } = pForum;
      let { newForumName } = info;
      // 用户主页链接
      r.c.NFRUserProfile = tools.getUrl("userHome", uid);
      // 用户名
      const user = await UserModel.findOne({uid}, {username: 1});
      r.c.NFRUserName = user.username;
      // 新专业名
      r.c.NFRName = newForumName;
      // 审核页面链接
      r.c.NFRReview = "/nkc/applyForum";
    }

    // 新专业创始人邀请相关
    else if(type === "inviteFounder") {
      let { pfid, myUid } = r.c;
      let pForum = await PreparationForumModel.findOne({pfid});
      if(!pForum) {
        continue;
      }
      let { uid, info } = pForum;
      let { newForumName } = info;
      // 用户主页链接
      r.c.IFUserProfile = tools.getUrl("userHome", uid);
      // 用户名
      const user = await UserModel.findOne({uid}, {username: 1});
      r.c.IFUserName = user.username;
      // 新专业名
      r.c.IFName = newForumName;
      // 处理邀请页面
      // r.c.IFAcceptPageUrl = `/founderInvite/accept/${pfid}/page`;
      r.c.IFAcceptPageUrl = `/u/${r.r}/forum/invitation?pfid=${pfid}`;
    }

    // 新专业申请审核通过相关
    else if(type === "newForumReviewResolve") {
      let { pfid, fid } = r.c;
      let forum = await ForumModel.findOne({fid});
      let pForum = await PreparationForumModel.findOne({pfid});
      if(!forum) continue;
      let { displayName } = forum;
      // 专业名
      r.c.NFRSName = displayName;
      // 专业主页
      r.c.NFRSUrl = tools.getUrl("forumHome", fid);
      // 筹备专业截止日期
      r.c.NFRSExpired = tools.timeFormat(pForum.expired);
    }

    // 新专业申请审核不通过相关
    else if(type === "newForumReviewReject") {
      let { pfid } = r.c;
      let pForum = await PreparationForumModel.findOne({pfid});
      if(!pForum) continue;
      let { info } = pForum;
      let { newForumName } = info;
      // 专业名
      r.c.NFRJName = newForumName;
      // 专业主页
      r.c.NFRJUrl = tools.getUrl("forumHome", pfid);
    }

    // 筹备专业转正或者关闭相关
    else if(type === "becomeFormalForum") {
      let { name, formal } = r.c;
      // 专业名
      r.c.BFFName = name;
      // 消息
      if(formal) {
        r.c.BFFMessage = "已转为正式专业";
      } else {
        r.c.BFFMessage = "已被关停，此筹备专业未能在30天内产出50篇文章";
      }
    }

    if(r.c.thread) {
      r.c.thread = (await ThreadModel.extendThreads([r.c.thread], {
        forum: false,
        category: false,
        firstPost: true,
        firstPostUser: false,
        userInfo: false,
        lastPost: false,
        lastPostUser: false,
        firstPostResource: false,
        htmlToText: false,
        count: 200
      }))[0];
      r.c.thread.url = `/t/${r.c.thread.tid}`;
    }
    if(r.c.post) {
      r.c.post = r.c.post.toObject();
      r.c.post.url = await PostModel.getUrl(r.c.post);
      r.c.post.c = apiFunction.obtainPureText(r.c.post.c);
    }
    results.push(r);
  }
  return results;

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
  const redis = require("../redis");
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
  await redis.pubMessage(message);
};

/**
 * 发送新办专业申请审核
 */
messageSchema.statics.sendNewForumReviewMessage = async ({uid, pfid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const redis = require("../redis");
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
  await redis.pubMessage(message);
}

/**
 * 发送新专业创始人邀请
 */
messageSchema.statics.sendInviteFounder = async ({pfid, targetUid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const redis = require("../redis");
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
  await redis.pubMessage(message);
}

/**
 * 发送新专业申请审核通过消息
 */
messageSchema.statics.sendNewForumReviewResolve = async ({pfid, fid, targetUid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const redis = require("../redis");
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
  await redis.pubMessage(message);
}

/**
 * 发送新专业申请审核不通过消息
 */
messageSchema.statics.sendNewForumReviewReject = async ({pfid, targetUid}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const redis = require("../redis");
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
  await redis.pubMessage(message);
}

/**
 * 发送筹备专业转正或者关闭消息
 */
messageSchema.statics.sendBecomeFormalForum = async ({pfid, targetUid, formal}) => {
  const MessageModel = mongoose.model("messages");
  const SettingModel = mongoose.model("settings");
  const PreparationForumModel   = mongoose.model("pForum");
  const redis = require("../redis");
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
  await redis.pubMessage(message);
}

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
  const redis = require("../redis");
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
    await redis.pubMessage(message);
  }
};

/*
* 基金通知
* */
messageSchema.statics.sendFundMessage = async (applicationFormId, type) => {
  const FundApplicationFormModel = mongoose.model("fundApplicationForms");
  const FundModel = mongoose.model("funds");
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const MessageModel = mongoose.model("messages");
  const redis = require("../redis");
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
    await redis.pubMessage(message);
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
      await redis.pubMessage(message);
    }
  }
};

messageSchema.statics.extendMessage = async (uid, message) => {
  const messages = await mongoose.model("messages").extendMessages(uid, [message]);
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
  const getValue = MessageTypeModel.getValue;
  const plainEscaper = require("../nkcModules/plainEscaper");
  const messageType = await MessageTypeModel.findOne({_id: 'STU'});
  const {templates} = messageType;
  const templatesObj = {};
  templates.map(t => templatesObj[t.type] = t);
  const {c} = message;
  const {type} = c;
  const template = templatesObj[type];
  const {parameters} = template;
  let content = plainEscaper(template.content);
  content = content.replace(/\[url=(.*?)\((.*?)\)]/ig, (v1, v2, v3) => {
    let url, name;
    if(!parameters.includes(v2)) {
      url = v2;
    } else {
      url = getValue(v2, c);
    }
    if(!parameters.includes(v3)) {
      name = v3;
    } else {
      name = getValue(v3, c);
    }
    return `&nbsp;<a href="${url}" target="_blank">${name}</a>&nbsp;`
  });
  content = content.replace(/\[text=(.*?)]/ig, (v1, v2) => {
    let text;
    if(!parameters.includes(v2)) {
      text = v2;
    } else {
      text = getValue(v2, c);
    }
    return `&nbsp;<b>${text}</b>&nbsp;`
  });
  return content;
}

/*
* 拓展消息对象，用于reactNativeAPP，web端调整后公用
* */
messageSchema.statics.extendMessages = async (uid, messages) => {

  // contentType: html, file, video, voice, img, time
  // status: sent, sending, error

  const nkcRender = require("../nkcModules/nkcRender");
  const MessageModel = mongoose.model("messages");
  const {getUrl} = tools;
  const _messages = [];

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
        message.content = null;
      } else {
        if(typeof c === 'string') {
          message.contentType = 'html';
          message.content = c;
        } else {
          const {id, na, ty, vl} = c;
          message.contentType = ty; // img, voice, file, video
          message.content = {
            filename: na,
            fileId: id,
            fileUrl: getUrl('messageResource', id),
            fileCover: getUrl('messageCover', id),
            fileTimer: vl
          }
          if(ty === 'voice') {
            message.content.fileUrl += "?channel=mp3";
            message.content.playStatus = 'unPlay';
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
    } else if(ty === 'newFriends') {
      // 新朋友
      const {toc, username, agree, description, _id} = m;
      message.time = toc;
      message.s = m.uid;
      message.content = `
        <div class="server-message">
          用户「
          <a href="/u/${m.uid}" target="_blank">
            ${username}
          </a>
          」申请添加你为好友。
          </br>附加说明：${description || '无'}
          </br>
          <div class="button-container">
          ${(() => {
            if(agree === 'null') {
              return `
                <button class="agree" onclick="window.app.newFriendOperation(${_id}, 'true')">同意</button>
                <button class="disagree" onclick="window.app.newFriendOperation(${_id}, 'false')">拒绝</button>
                <button class="ignored" onclick="window.app.newFriendOperation(${_id}, 'ignored')">忽略</button>` 
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
        // 处理链接 上下顺序不能变 处理链接函数里做了 > 判断
        message.content = nkcRender.URLifyHTML(message.content);
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
* 标记信息为已读
* */
messageSchema.statics.markAsRead = async (type, uid, tUid) => {
  const MessageModel = mongoose.model("messages");
  const CreatedChatModel = mongoose.model('createdChat');
  const SystemInfoLogModel = mongoose.model('systemInfoLogs');
  const redis = require("../redis");
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
    const allInfo = await MessageModel.find({ty: 'STE'}, {_id: 1});
    const allInfoLog = await SystemInfoLogModel.find({uid}, {mid: 1});
    const allInfoId = [];
    const allInfoLogId = [];

    for(const o of allInfo) {
      allInfoId.push(o._id);
    }
    for(const o of allInfoLog) {
      allInfoLogId.push(o.mid);
    }
    for(const id of allInfoId) {
      if(!allInfoLogId.includes(id)) {
        const log = SystemInfoLogModel({
          uid,
          mid: id
        });
        await log.save();
      }
    }
  } else if(type === 'STU'){
    await MessageModel.updateMany({ty: type, r: uid, vd: false}, {$set: {vd: true}});
  }
  await redis.pubMessage({
    ty: 'markAsRead',
    messageType: type,
    uid,
    targetUid: tUid
  });
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

const MessageModel = mongoose.model('messages', messageSchema);
module.exports = MessageModel;

