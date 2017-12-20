const settings = require('../settings');
const mongoose = settings.database;
const ResourceModel = mongoose.model('resources');
const InviteModel = mongoose.model('invites');
const ReplyModel = mongoose.model('replies');

const postSchema = new Schema({
  pid: {
    type: String,
    unique: true,
    required: true
  },
  atUsers: {
    type: [Schema.Types.Mixed],
    default: []
  },
  c: {
    type: String,
    default: ''
  },
  credits: {
    type: [Schema.Types.Mixed],
    default: []
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  ipoc: {
    type: String,
    default: '0.0.0.0'
  },
  iplm: {
    type: String,
  },
  l: {
    type: String,
    required: true
  },
  recUsers: {
    type: [String],
    default: []
  },
  rpid: {
    type: [String],
    default: []
  },
  t: {
    type: String,
    default: ''
  },
  fid: {
    type: String,
    required: true,
    index: 1
  },
  tid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  uidlm: {
    type: String,
    index: 1
  },
  hasImage: {
    type: Boolean,
    index: true
  }
}, {toObject: {
  getters: true,
  virtuals: true
}});

postSchema.pre('save' , function(next) {
  if(!this.iplm) {
    this.iplm = this.ipoc;
  }
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  if(!this.uidlm) {
    this.uidlm = this.uid;
  }
  next();
});

postSchema.virtual('user')
  .get(function() {
    return this._user
  })
  .set(function(u) {
    this._user = u
  });

postSchema.virtual('resources')
  .get(function() {
    return this._resources
  })
  .set(function(rs) {
    this._resources = rs
  });

postSchema.virtual('thread')
  .get(function() {
    return this._thread
  })
  .set(function(t) {
    this._thread = t
  });

postSchema.methods.extendThread = async function() {
  const ThreadModel = require('./ThreadModel');
  return this.thread = await ThreadModel.findOnly({tid: this.tid})
};

postSchema.methods.extendResources = async function() {
  const ResourceModel = require('./ResourceModel');
  return this.resources = await ResourceModel.find({pid: this.pid})
};

postSchema.methods.extendUser = async function() {
  const UserModel = require('./UserModel');
  return this.user = await UserModel.findOnly({uid: this.uid});
};


postSchema.methods.ensurePermission = async function(ctx) {
  const {ThreadModel} = ctx.db;
  const thread = await ThreadModel.findOnly({tid: this.tid});
  // 同时满足以下条件返回true
  // 1、能浏览所在帖子
  // 2、post没有被禁 或 用户为该板块的版主 或 具有比版主更高的权限
  return (await thread.ensurePermission(ctx) && (!this.disabled || await thread.ensurePermissionOfModerators(ctx)));
};

postSchema.pre('save', async function(next) {
  // analyzing the content(post.c) to find p.atUsers change

  const {c} = this;
  const atUsers = []; //user info {username, uid}
  const existedUsers = []; //real User mongoose data model
  const matchedUsernames = c.match(/@([^@\s]*)\s/g);
  if (matchedUsernames) {
    await Promise.all(matchedUsernames.map(async str => {
      const username = str.slice(1, -1); //slice the @ and [\s] in reg
      const user = await db.UserModel.findOne({username});
      if (user) {
        const {username, uid} = user;
        let flag = true; //which means this user does not in existedUsers[]
        for (const u of atUsers) {
          if (u.username === username)
            flag = false;
        }
        if (flag) {
          atUsers.push({username, uid});
          existedUsers.push(user)
        }
      }
    }))
  }
  this.atUsers = atUsers;
  return next()
});

postSchema.post('save', async function(doc, next) {
  // analyzing the content (post.c) and changing the
  // resource.references to make resource has a
  // correct reference to the post

  const {c, pid} = doc;
  const resources = (c.match(/{r=[0-9]{1,20}}/g) || [])
    .map(str => str.replace(/{r=([0-9]{1,20})}/, '$1'));
  await Promise.all(resources.map(async rid => {
    const resource = ResourceModel.findOne({rid});
    if(resource) {
      if(!resource.references.includes(pid)) {
        resources.references.push(pid);
        await resource.save()
      }
    }
  }));
  return next()
});

postSchema.post('save', async function(doc, next) {
  // analyzing the p.c to make a notification of quote

  const {c,} = doc;
  const quotes = c.match(/\[quote=(.*?),(.*?)]/);


});

postSchema.post('save', async function(doc, next) {
  // if p.atUsers has changed, we should generate a invitation

  const {_initial_state_, atUsers} = doc;
  const oldAtUsers = _initial_state_.atUsers;
  const notInformedUsers = atUsers
    .map(at => !oldAtUsers // map the user not in oldAtUsers
      .find(oldAt => oldAt.uid === at.uid));
  await Promise.all(notInformedUsers
    .map(uid => new InviteModel({
      invitee: uid,
      inviter: doc.uid,
      pid: doc.pid
    }).save())
  );
  return next()
});

module.exports = mongoose.model('posts', postSchema);