const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const postSchema = new Schema({
  pid: {
    type: String,
    unique: true,
    required: true,
    index: 1
  },
  atUsers: {
    type: Array,
    default: []
  },
  c: {
    type: String,
    default: ''
  },
  credits: {
    type: Array,
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
    default: []
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
    required: true
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
});

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

postSchema.methods.extend = async function() {
  const ResourceModel = require('./ResourceModel');
  const UserModel = require('./UserModel');
  const user = await UserModel.findOnly({uid:this.uid});
  let obj = this.toObject();
  const resources = [];
  await Promise.all(this.r.map(async r => {
    const resourceOfDB = await ResourceModel.findOne({rid: r});
    if(resourceOfDB) resources.push(resourceOfDB);
  }));
  obj = Object.assign(obj, {user});
  obj = Object.assign(obj, {resources});
  return obj
};

postSchema.methods.getUser = async function() {
  const UserModel = require('./UserModel');
  return await UserModel.findOnly({uid: this.uid});
};

postSchema.methods.ensurePermission = async function(visibleFid) {
  const ThreadModel = require('./ThreadModel');
  const thread = await ThreadModel.findOnly({tid: this.tid});
  return visibleFid.includes(thread.fid);
};

module.exports = mongoose.model('posts', postSchema);