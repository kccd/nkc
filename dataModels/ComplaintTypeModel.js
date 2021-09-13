const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  type: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  //添加时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  description: {
    type: String,
    default: ''
  }
}, {
  collection: "complaintTypes"
});

/*
* 添加类型到投诉类型列表中
* @return {Object} type 添加的投诉类型
* @author panbing 2020/09/13
* */
schema.statics.insertCom = async (props) => {
  const SettingModel = mongoose.model('settings');
  const {uid, type, description, toc} = props;
  const recordId = await SettingModel.getNewId();
  const list = mongoose.model('complaintTypes');
  await list({
    _id: recordId,
    uid,
    type,
    description,
    toc
  }).save();
};

schema.statics.saveComplaintTypelistToRedis = async () => {
  const redis = require('../settings/redis');
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const complaintTypeListModel = mongoose.model('complaintTypes');
  let id = await complaintTypeListModel.find({}, {_id: 1});
  id = id.map(id => !!id);
  const redisClient = redis();
  const key = getRedisKeys('complaintTypes');
  await redisClient.resetSetAsync(key, id);
};
module.exports = mongoose.model("complaintTypes", schema);
