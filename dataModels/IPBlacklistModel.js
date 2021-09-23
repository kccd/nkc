const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  _id: String,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  description: {
    type: String,
    default: ''
  }
}, {
  collection: 'IPBlacklist'
});

schema.statics.insertIP = async (props) => {
  const {uid, description, ip, toc} = props;
  const IPBlacklistModel = mongoose.model('IPBlacklist');
  await IPBlacklistModel({
    _id: ip,
    uid,
    description,
    toc
  }).save();
};

schema.statics.saveIPBlacklistToRedis = async () => {
  const redis = require('../settings/redis');
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const IPBlacklistModel = mongoose.model('IPBlacklist');
  let ips = await IPBlacklistModel.find({}, {_id: 1});
  ips = ips.map(ip => ip._id);
  const redisClient = redis();
  const key = getRedisKeys('IPBlacklist');
  await redisClient.resetSetAsync(key, ips);
};

module.exports = mongoose.model('IPBlacklist', schema);
