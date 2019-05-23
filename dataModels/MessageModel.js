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
    enum: ['UTU', 'UTR', 'STU', 'STE', 'STR'],
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

  // 判断对方是否设置了“需要添加好友之后才能聊天”
  const friendRelationship = await FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
  if(!friendRelationship && !sendToEveryOne) {
    const targetUserGeneralSettings = await UsersGeneralModel.findOnly({uid: targetUser.uid});
    const onlyReceiveFromFriends = targetUserGeneralSettings.messageSettings.onlyReceiveFromFriends;
    if(onlyReceiveFromFriends) throwErr(403, '对方设置了只接收好友的聊天信息，请先添加该用户为好友。');
  }

};

messageSchema.statics.extendSTUMessages = async (arr) => {
  const moment = require("moment");
  const PostModel = mongoose.model("posts");
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const apiFunction = require("../nkcModules/apiFunction");
  const results = [];

  const timeout = 72 * 60 * 60 * 1000;

  for(let r of arr) {
    r = r.toObject();
    const {type, pid, targetPid, targetUid, tid} = r.c;
    if(type === "at") {
      const post = await PostModel.findOne({pid: targetPid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      const user = await UserModel.findOne({uid: targetUid});
      if(!user) continue;
      r.c.post = post;
      r.c.user = user;
      r.c.thread = thread;
    } else if(type === "digestPost") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      r.c.post = post;
    } else if(type === "digestThread") {
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await PostModel.findOne({tid: post.tid});
      if(!thread) continue;
      r.c.thread = thread;
    } else if(type === "bannedThread") {
      const thread = await ThreadModel.findOne({tid});
      if(!thread) continue;
      r.c.thread = thread;
    } else if(type === "bannedPost") {
      const post = await ThreadModel.findOne({pid});
      if(!post) continue;
      r.c.post = post;
    } else if(type === "threadWasReturned") {
      const thread = await ThreadModel.findOne({tid});
      if(!thread) continue;
      r.c.thread = thread;
      r.c.deadline = moment(Date.now() + timeout).format("YYYY-MM-DD HH:mm:ss");
    } else if(type === "postWasReturned") {
      const post = await ThreadModel.findOne({pid});
      if(!post) continue;
      r.c.post = post;
    } else if(type === "replyPost") {
      const post = await PostModel.findOne({pid: targetPid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      const user = await UserModel.findOne({uid: post.uid});
      if(!user) continue;
      r.c.user = user;
      r.c.thread = thread;
      r.c.post = post;
    } else if(type === "replyThread") {
      const post = await PostModel.findOne({pid: targetPid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      const user = await UserModel.findOne({uid: post.uid});
      if(!user) continue;
      r.c.user = user;
      r.c.thread = thread;
      r.c.post = post;
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
    }
    if(r.c.post) {
      r.c.post = r.c.post.toObject();
      const step = await ThreadModel.getPostStep(r.c.post.tid, {
        pid: r.c.post.pid,
        disabled: false
      });
      r.c.post.url = `/t/${r.c.post.tid}?page=${step.page}&highlight=${r.c.post.pid}#${r.c.post.pid}`;
    }
    results.push(r);
  }

  return results;

};

/*messageSchema.statics.extendReminder = async (arr) => {
  const moment = require('moment');
  const PostModel = mongoose.model('posts');
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const apiFunction = require('../nkcModules/apiFunction');
  const results = [];
  for(const r of arr) {
    const {c, tc} = r;
    const {type} = c;
    if(!type) continue;
    const r_ = r.toObject();
    if(type === 'replyThread') {
      const {pid, targetPid} = c;
      const post = await PostModel.findOne({pid});
      const targetPost = await PostModel.findOne({pid: targetPid});
      if(!post || !targetPost) continue;
      const targetUser = await UserModel.findOne({uid: targetPost.uid});
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!targetUser || !thread) continue;
      const pageObj = await thread.getStep({pid: targetPid, disabled: false});
      r_.targetUser = {
        username: targetUser.username,
        uid: targetUser.uid
      };
      r_.post = {
        pid,
        t: post.t,
        tid: post.tid
      };
      r_.targetPost = {
        pid: targetPid,
        tid: post.tid,
        c: apiFunction.obtainPureText(targetPost.c),
        page: pageObj.page
      };
    } else if(type === 'digestThread') {
      const {targetUid, pid} = c;
      const targetUser = await UserModel.findOne({uid: targetUid});
      const post = await PostModel.findOne({pid});
      if(!post || !targetUser) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      r_.targetUser = {
        username: targetUser.username,
        uid: targetUser.uid
      };
      r_.post = {
        tid: post.tid,
        pid: post.pid,
        t: post.t,
        c: apiFunction.obtainPureText(post.c)
      };
    } else if(type === 'digestPost') {
      const {targetUid, pid} = c;
      const targetUser = await UserModel.findOne({uid: targetUid});
      const post = await PostModel.findOne({pid});
      if(!post || !targetUser) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      r_.targetUser = {
        username: targetUser.username,
        uid: targetUser.uid
      };
      const pageObj = await thread.getStep({pid, disabled: false});
      r_.post = {
        tid: post.tid,
        pid: post.pid,
        c: apiFunction.obtainPureText(post.c, true, 50),
        page: pageObj.page
      };
    } else if(type === '@') {
      const {targetUid, targetPid} = c;
      const targetUser = await UserModel.findOne({uid: targetUid});
      const targetPost = await PostModel.findOne({pid: targetPid});
      if(!targetUser || !targetPost) continue;
      const targetThread = await ThreadModel.findOne({tid: targetPost.tid});
      if(!targetThread) continue;
      const pageObj = await targetThread.getStep({pid: targetPid, disabled: false});
      r_.targetPost = {
        pid: targetPost.pid,
        tid: targetPost.tid,
        page: pageObj.page
      };
      r_.targetUser = {
        uid: targetUser.uid,
        username: targetUser.username
      }
    } else if(type === 'bannedPost') {
      const {pid, rea} = c;
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      const firstPost = await thread.extendFirstPost();
      r_.post = {
        pid
      };
      r_.firstPost = {
        t: firstPost.t,
        tid: firstPost.tid,
        pid: firstPost.pid
      };
      r_.reason = rea;
    } else if(type === 'postWasReturned') {
      const {pid, rea} = c;
      const post = await PostModel.findOne({pid});
      if(!post) continue;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      const firstPost = await thread.extendFirstPost();
      r_.post = {
        pid,
      };
      r_.firstPost = {
        t: firstPost.t,
        tid: firstPost.tid,
        pid: firstPost.pid
      };
      r_.reason = rea;
      const t = new Date(tc).getTime() + 72*60*60*1000;
      r_.timeLimit = moment(t).format('YYYY-MM-DD HH:mm:ss');
    } else if(type === 'threadWasReturned') {
      const {tid, rea} = c;
      const thread = await ThreadModel.findOne({tid});
      const firstPost = await thread.extendFirstPost();
      if(!thread) continue;
      r_.firstPost = {
        t: firstPost.t,
        tid: firstPost.tid,
        pid: firstPost.pid
      };
      r_.reason = rea;
      const t = new Date(tc).getTime() + 72*60*60*1000;
      r_.timeLimit = moment(t).format('YYYY-MM-DD HH:mm:ss');
    } else if(type === 'bannedThread') {
      const {tid, rea} = c;
      const thread = await ThreadModel.findOne({tid});
      const firstPost = await thread.extendFirstPost();
      if(!thread) continue;
      r_.firstPost = {
        t: firstPost.t,
        tid: firstPost.tid,
        pid: firstPost.pid
      };
      r_.reason = rea;
    } else if(type === 'replyPost') {
      const {targetPid, pid} = c;
      const targetPost = await PostModel.findOne({pid: targetPid});
      const post = await PostModel.findOne({pid});
      if(!targetPost || !post) continue;
      const targetUser = await UserModel.findOne({uid: targetPost.uid});
      if(!targetUser) continue;
      const thread = await ThreadModel.findOne({tid: targetPost.tid});
      if(!thread) continue;
      const firstPost = await PostModel.findOne({pid: thread.oc});
      if(!firstPost) continue;
      const pageObj = await thread.getStep({pid: targetPid + '', disabled: false});
      r_.targetPost = {
        pid: targetPost.pid,
        c: apiFunction.obtainPureText(targetPost.c),
        page: pageObj.page,
        tid: targetPost.tid
      };
      r_.targetUser = {
        uid: targetUser.uid,
        username: targetUser.username,
      };
      r_.firstPost = {
        t: firstPost.t,
        tid: firstPost.tid
      };
    } else if(type === 'xsf') {
      const {pid, num} = c;
      const post = await PostModel.findOnly({pid});
      r_.post = {
        pid: post.pid
      };
      r_.num = num;
    }
    r_.ty = 'STU';
    r_.c = {
      type: type
    };
    results.push(r_);
  }
  return results;
};*/

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
/*messageSchema.statics.getUsersFriendsUid = async (uid) => {
  const MessageModel = mongoose.model('messages');
  let rList = await MessageModel.aggregate([
    {
      $match: {
        s: uid,
        r: {
          $ne: ''
        }
      }
    },
    {
      $sort: {
        tc: -1
      }
    },
    {
      $group: {
        _id: '$r'
      }
    }
  ]);
  let sList = await MessageModel.aggregate([
    {
      $match: {
        r: uid,
        s: {
          $ne: ''
        }
      }
    },
    {
      $sort: {
        tc: -1
      }
    },
    {
      $group: {
        _id: '$s'
      }
    }
  ]);
  const list = rList.concat(sList);
  let uidList = [];
  for(const o of list) {
    if(o._id !== uid && !uidList.includes(o._id)) {
      uidList.push(o._id);
    }
  }
  return uidList;
};*/

const MessageModel = mongoose.model('messages', messageSchema);
module.exports = MessageModel;