const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  type: {
    type: String,
    required: true,
    index: 1,
  },
  disabled:{
    type: Boolean,
    default: false
  },
  uid: {
    type: String,
    default: '',
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
  const {uid, type, description} = props;
  const recordId = await SettingModel.operateSystemID("complaintTypes",1);
  const ComplainTypeModel = mongoose.model('complaintTypes');
  await ComplainTypeModel({
    _id: recordId,
    uid,
    type,
    description,
  }).save();
};

module.exports = mongoose.model("complaintTypes", schema);
