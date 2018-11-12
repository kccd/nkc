const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const shareSchema = new Schema({
  token: {
    type: String,
    unique: true,
    required: true
  },
  shareUrl: {
    type: String,
    default: null
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true
  },
  hits: {
    type: String,
    default: 0
  },
  // token的状态
  // invalid 失效
  // effective 有效
  tokenLife: {
    type: String,
    default: "effective"
  },
  // 链接类型
  // thread post user forum
  tokenType: {
    type: String,
    default: null
  },
  ips: {
    type: [String],
    default: []
  }
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
});



shareSchema.virtual('user')
.get(function() {
  return this._user;
})
.set(function(user) {
  this._user = user;
});
module.exports = mongoose.model('share', shareSchema, 'share');