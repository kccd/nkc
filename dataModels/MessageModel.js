const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
  判断用户是否有权限发送信息
  @param fromUid 当前用户ID
  @param toUid 对方用户ID
  @parma sendToEveryOne 是否拥有”不加好友也能发送信息“的权限
  @author pengxiguaa 2019/2/12
*/
messageSchema.statics.ensurePermission = async (fromUid, toUid, sendToEveryOne) => {
  const UserModel = mongoose.model('users');
  const MessageModel = mongoose.model('messages');
  const FriendModel = mongoose.model('friends');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const MessageBlackListModel = mongoose.model("messageBlackLists");
  const ThreadModel = mongoose.model("threads");
  const apiFunction = require('../nkcModules/apiFunction');
  const user = await UserModel.findOnly({uid: fromUid});
  const targetUser = await UserModel.findOnly({uid: toUid});
  const {messageCountLimit, messagePersonCountLimit} = await user.getMessageLimit();
  const today = apiFunction.today();
  const messageCount = await MessageModel.count({
    s: user.uid,
    ty: 'UTU',
    tc: {
      $gte: today
    }
  });
  if(messageCount >= messageCountLimit) {
    throwErr(403, `根据您的证书和等级，您每天最多只能发送${messageCountLimit}条信息`);
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
        _id: '$r',
      }
    }
  ]);
  todayUid = todayUid.map(o => o.uid);
  if(!todayUid.includes(toUid)) {
    if(todayUid.length >= messagePersonCountLimit) {
      throwErr(403, `根据您的证书和等级，您每天最多只能给${messagePersonCountLimit}个用户发送信息`);
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
  let blackList = await MessageBlackListModel.findOne({
    uid: fromUid,
    tUid: toUid
  });
  if(blackList) throwErr(403, "您已将对方添加到了消息黑名单中，无法发送消息。");
  if(!sendToEveryOne) {
    blackList = await MessageBlackListModel.findOne({
      uid: toUid,
      tUid: fromUid
    });
    if(blackList) throwErr(403, "对方拒绝接送您的消息。");
  }

  // 系统防骚扰
  const messageSettings = (await mongoose.model("settings").findById("message")).c;
  const {customizeLimitInfo} = messageSettings;
  const userGeneral = await UsersGeneralModel.findOnly({uid: targetUser.uid});
  const {status, timeLimit, digestLimit, xsfLimit, gradeLimit} = userGeneral.messageSettings.limit;
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

const MessageModel = mongoose.model('messages', messageSchema);
module.exports = MessageModel;