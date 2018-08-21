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
  *   type: String, [digestPost, @, replyThread, bannedThread, threadWasReturned, bannedPost, postWasReturned, recommend]
  *   fromTid: String,
  *   fromPid: String,
  *   fromUid: String,
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
}, {
  collection: 'messages',
  toObject: {
    getters: true,
    virtuals: true
  }
});

messageSchema.statics.extendReminder = async (arr) => {
  const PostModel = mongoose.model('posts');
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const results = [];
  for(const r of arr) {
    const {c, tc} = r;
    const {type, pid, targetPid} = c;
    if(!type) continue;
    if(type === 'replyThread') {
      const post = await PostModel.findOne({pid});
      const targetPost = await PostModel.findOne({pid: targetPid});
      if(!post || !targetPost) continue;
      const targetUser = await UserModel.findOne({uid: targetPost.uid});
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!targetUser || !thread) continue;
      const pageObj = await thread.getStep({pid: targetPid, disabled: false});
      const r_ = r.toObject();
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
        c: targetPost.c,
      };
      r_.ty = type;
      results.push(r_);
    }
  }
  return results;
};


const MessageModel = mongoose.model('messages', messageSchema);
module.exports = MessageModel;