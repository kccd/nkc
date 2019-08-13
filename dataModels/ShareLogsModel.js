const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shareLogsSchema = new Schema({
  /**
   * 日志唯一id
   */
  id: {
    type: String,
    unique: true,
    required: true
  },
  /**
   * 用户id 游客记为visit
   */
  uid: {
    type: String,
    default: "visit"
  },
  /**
   * 日志记录时间
   */
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  /**
   * 设备类型
   * 暂取user-agent
   */
  machine: {
    type: String,
    default: ''
  },
  /**
   * 操作人ip
   * 取不到ip则记录为0.0.0.0
   */
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  /**
   * 端口
   */
  port: {
    type: String,
    default: '0000'
  },
  /**
   * 分享类型
   * post 回复；thread 文章；activity 活动；cloumn 专栏；user 用户名片；forum 专业；and so on
   */
	shareType: {
		type: String,
		default: 'all'
  },
  /**
   * 分享码
   */
  code: {
    type: String,
    default: ''
  },
  /**
   * 原始url
   */
  originUrl: {
    type: String,
    default: ''
  },
  /**
   * 科创币奖励
   * 数字类型，如无科创币奖励则记为0
   */
  kcb: {
    type: Number,
    default: 0
  },
  /**
   * 类型
   * 发起分享：spo
   * 点击分享：cli
   */
  type: {
    type: String,
    default: ""
  }
}, {
	collection: 'shareLogs',
  toObject: {
    getters: true,
    virtuals: true
  }
});

const ShareLogsModel = mongoose.model('shareLogs', shareLogsSchema);
module.exports = ShareLogsModel;