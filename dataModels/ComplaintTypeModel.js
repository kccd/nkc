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
    required: true,
    default: true
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
  const {uid, type, description, toc, disabled} = props;
  const recordId = await SettingModel.operateSystemID("complaintTypes",1);
  const list = mongoose.model('complaintTypes');
  await list({
    _id: recordId,
    uid,
    type,
    description,
    toc,
    disabled
  }).save();
};

// schema.statics.defaultCom = async (props) => {
//   const SettingModel = mongoose.model('settings');
//   const {uid, type, description, toc, disabled} = props;
//   const recordId = await SettingModel.operateSystemID("complaintTypes",1);
//   const list = mongoose.model('complaintTypes');
//   await list({
//     _id: recordId,
//     uid,
//     type,
//     description,
//     toc,
//     disabled
//   }).save();
// };
// schema.statics.updataCom = async (props) => {
//   const SettingModel = mongoose.model('settings');
//   const {_id, disabled} = props;
//   const list = mongoose.model('complaintTypes');
//   await list({
//     _id,
//     disabled
//   }).save();
// };

module.exports = mongoose.model("complaintTypes", schema);
