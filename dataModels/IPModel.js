const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  ip: {
    type: String,
    index: 1,
    default: ''
  }
}, {
  collection: 'ips'
});

schema.statics.saveIPAndGetToken = async (ip) => {
  const SettingModel = mongoose.model('settings');
  const IPModel = mongoose.model('ips');
  ip = ip.trim();
  let oldData = await IPModel.findOne({ip});
  if(!oldData) {
    const _id = await SettingModel.newObjectId();
    oldData = IPModel({
      _id,
      ip,
    });
    await oldData.save();
  }
  return oldData._id;
}

schema.statics.getIPByToken = async (token) => {
  const IPModel = mongoose.model('ips');
  const data = await IPModel.findOne({_id: token.trim()});
  return data?data.ip:'';
}

schema.statics.getTokenByIP = async (ip) => {
  const IPModel = mongoose.model('ips');
  const data = await IPModel.findOne({ip: ip.trim()});
  return data?data._id: '';
};

schema.statics.getIPByTokens = async (tokens) => {
  const IPModel = mongoose.model('ips');
  const ips = await IPModel.find({_id: {$in: tokens}});
  const result = {};
  for(const i of ips) {
    result[i._id] = i.ip;
  }
  return result;
};

module.exports = mongoose.model('ips', schema);
