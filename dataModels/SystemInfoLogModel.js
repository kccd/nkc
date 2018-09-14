const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const systemInfoLogSchema = new Schema({

  // 消息id
  mid: Number,

  // 时间
  tc: {
    type: Date,
    default: Date.now,
    index: 1
  },

  // 用户id
  uid: {
    type: String,
    required: true,
    index: 1
  }

}, {
  collection: 'systemInfoLogs'
});



const SystemInfoLogModel = mongoose.model('systemInfoLogs', systemInfoLogSchema);
module.exports = SystemInfoLogModel;