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
  *   type: String, [digestThread, digestPost, @, replyThread, bannedThread, threadWasReturned, bannedPost, postWasReturned, recommend]
  * }
  *
  *
  *
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
    defualt: '',
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
  }
}, {
  collection: 'messages',
  toObject: {
    getters: true,
    virtuals: true
  }
});

messageSchema.statics.extendReminder = async (arr) => {
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
        tid: post.tid,
        page: pageObj.page
      };
      r_.targetPost = {
        pid: targetPid,
        c: apiFunction.obtainPureText(targetPost.c),
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
      const pageObj = await targetThread.getStep({targetPid, disabled: false});
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
    }
    r_.ty = type;
    results.push(r_);
  }
  return results;
};

messageSchema.statics.getUsersFriendsUid = async (uid) => {
  const MessageModel = mongoose.model('messages');
  let rList = await MessageModel.aggregate([
    {
      $match: {
        s: uid
      }
    },
    {
      $sort: {
        tc: -1
      }
    },
    {
      $group: {
        _id: '$r',
      }
    }
  ]);
  let sList = await MessageModel.aggregate([
    {
      $match: {
        r: uid
      }
    },
    {
      $sort: {
        tc: -1
      }
    },
    {
      $group: {
        _id: '$s',
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
};


messageSchema.statics.sendNotification = (type, toUid, fromUid) => {
  const noticeSocket = global.NKC.noticeSockets[toUid];
  if(noticeSocket) {
    noticeSocket.emit('notice', {
      type,
      fromUid
    });
  }
};
/*messageSchema.statics.setTargetUid = (uid, targetUid) => {
  const userSockets = global.NKC.sockets[uid];
  if(userSockets && userSockets.length !== 0) {
    userSockets.map(s => s.NKC.targetUid = targetUid);
  }
};*/
messageSchema.statics.execute = (uid, func) => {
  const userSockets = global.NKC.sockets[uid];
  if(userSockets && userSockets.length !== 0) {
    userSockets.map(socket => {
      func(socket);
    })
  }
};
/*messageSchema.statics.getTargetUid = (uid) => {
  const userSockets = global.NKC.sockets[uid];
  if(userSockets && userSockets.length !== 0) {
    return userSockets[0].NKC.targetUid;
  }
};*/

const MessageModel = mongoose.model('messages', messageSchema);
module.exports = MessageModel;