const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

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
  r: {
    type: [String],
    default: [],
    index: 1
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
  return this.resources = await Promise.all(
    this.r.map(r => ResourceModel.findOnly({rid: r}))
  );
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


module.exports = mongoose.model('posts', postSchema);