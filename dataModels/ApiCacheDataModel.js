/* 
  接口缓存表
  @author Kris 2019/4/9
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const apiCacheDataSchema = new Schema({
  // id
  id: {
    type: String,
    index: 1
  },
  // 时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 类型
  type: {
    type: String,
    default: ""
  },
  // 接口返回
  c: {
    type: String,
    default: "",
  },
}, {
  collection: 'apiCacheData'
});
const ApiCacheDataModel = mongoose.model('apiCacheData', apiCacheDataSchema);
module.exports = ApiCacheDataModel;