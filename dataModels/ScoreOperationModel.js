const mongoose = require("../settings/database");
const getRedisKeys = require('../../nkcModules/getRedisKeys');
const redisClient = require('../../settings/redisClient');
const schema = new mongoose.Schema({
  _id: Number,
  type: {
    type: String,
    required: true,
    index: 1
  },
  count: {
    type: Number,
    default: 0,
  },
  cycle: {
    type: String,
    default: 'day',
    index: 1,
  },
  score1: {
    type: Number,
    default: 0,
  },
  score2: {
    type: Number,
    default: 0,
  },
  score3: {
    type: Number,
    default: 0,
  },
  score4: {
    type: Number,
    default: 0,
  },
  score5: {
    type: Number,
    default: 0,
  },
  score6: {
    type: Number,
    default: 0,
  },
  score7: {
    type: Number,
    default: 0,
  },
  forumAvailable: {
    type: Boolean, // 专业可用
    required: true,
    index: 1,
  },
  from: {
    type: String,
    default: 'default', // default: 后台积分策略, forum: 专业积分策略
    index: 1,
  },
  fid: {
    type: String,
    default: '',
    index: 1
  }
}, {
  collection: 'scoreOperations'
});

/**
 * 缓存所有积分操作设置
 */
schema.statics.saveAllScoreOperationToRedis = async () => {
  const ScoreOperationModel = mongoose.model('scoreOperations');
  const operations = await ScoreOperationModel.find();
  const redisOperationKeys = await redisClient.keysAsync(getRedisKeys(`searchScoreOperation`));
  for(const o of operations) {
    const {from, type} = o;
    const key = getRedisKeys('scoreOperation', from, type);
    const index = redisOperationKeys.indexOf(key);
    if(index !== -1) redisOperationKeys.splice(index, 1);
    await redisClient.setAsync(key, JSON.stringify(o));    
  }
  for(const k of redisOperationKeys) {
    await redisClient.delAsync(k);
  }
};


/**
 * 从缓存获取积分操作设置
 */
schema.statics.getScoreOperationFromRedis = async (from, type) => {
  let data = await redisClient.getAsync(getRedisKeys("scoreOperation", from, type));
  return !data
    ? null
    : JSON.parse(data);
}

/**
 * 下载附件是否需要积分
 */
schema.statics.downloadNeedScore = async () => {
  const SettingModel = mongoose.model("settings");
  const operation = await SettingModel.getDefaultScoreOperationByType("attachmentDownload");
  const enabledScoreTypes = await SettingModel.getEnabledScoresType();
  // 下载此附件是否需要积分状态位
  let needScore = false;
  // 此操作是否需要积分(更新状态位)
  for(let typeName of enabledScoreTypes) {
    let number = operation[typeName];
    // 如果设置的操作花费的积分不为0才考虑扣积分
    if(number !== 0) {
      needScore = true;
      break;
    }
  }
  return !needScore;
}

module.exports = mongoose.model('scoreOperations', schema);
