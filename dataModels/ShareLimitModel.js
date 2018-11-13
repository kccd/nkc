const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shareLimitSchema = new Schema({
  // 分享的类型
	shareType: {
		type: String,
		default: 'all'
  },
  // 分享类型的名称
	shareName: {
		type: String,
		default: '全部'
  },
  // 分享失效时间 小时
  // 默认12小时后失效
	shareLimitTime: {
    type: String,
    default: '12'
  },
  // 分享失效次数 次
  // 0 为不限次数
  // 默认为不限次数
	shareLimitCount: {
		type: String,
		default: '0'
	}
}, {
	collection: 'shareLimit',
  toObject: {
    getters: true,
    virtuals: true
  }
});

const ShareLimitModel = mongoose.model('shareLimit', shareLimitSchema);
module.exports = ShareLimitModel;