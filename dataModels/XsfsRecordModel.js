const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const xsfsRecordSchema = new Schema({
  _id: Number,
  // 学术分变化的人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 执行操作的人
  operatorId: {
    type: String,
    required: true,
    index: 1
  },
  num: {
    type: Number,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  description: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    required: true,
    index: 1
  },
  port: {
    type: String,
    required: true
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  canceled: {
    type: Boolean,
    default: false,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  lmOperatorId: {
    type: String,
    index: 1,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  },
  lmOperatorIp: {
    type: String,
    index: 1,
    default: ''
  },
  lmOperatorPort: {
    type: String,
    default: ''
  }
}, {
  collection: 'xsfsRecords',
  toObject: {
    getters: true,
    virtuals: true
  }
});
xsfsRecordSchema.virtual('fromUser')
  .get(function() {
    return this._fromUser;
  })
  .set(function(p) {
    this._fromUser = p;
  });
xsfsRecordSchema.virtual('type')
  .get(function() {
    return this._type;
  })
  .set(function(p) {
    this._type = p;
  });

xsfsRecordSchema.statics.extendXsfsRecords = async (records) => {
  const UserModel = mongoose.model('users');
  const PostModel = mongoose.model('posts');
  const uid = new Set(), pid = new Set();
  const usersObj = {}, postsObj = {};
  records.map(r => {
    uid.add(r.uid).add(r.operatorId);
    if(r.lmOperatorId) uid.add(r.lmOperatorId);
    pid.add(r.pid);
  });
  const posts = await PostModel.find({pid: {$in: [...pid]}});
  const users = await UserModel.find({uid: {$in: [...uid]}});
  users.map(u => {
    if(!usersObj[u.uid]) usersObj[u.uid] = [];
    usersObj[u.uid] = u;
  });
  await Promise.all(posts.map(async p => {
    if(!postsObj[p.pid]) postsObj[p.pid] = [];
    p = p.toObject();
    p.url = await PostModel.getUrl(p);
    postsObj[p.pid] = p;
  }));
  return records.map(r => {
    r = r.toObject();
    r.user = usersObj[r.uid];
    r.operator = usersObj[r.operatorId];
    if(r.lmOperatorId) r.lmOperator = usersObj[r.lmOperatorId];
    r.post = postsObj[r.pid];
    return r;
  });
};

module.exports = mongoose.model('xsfsRecords', xsfsRecordSchema);