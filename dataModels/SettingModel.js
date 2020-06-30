const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const redisClient = require('../settings/redisClient');

const settingSchema = new Schema({
  _id: String,
  c: {
    type: Schema.Types.Mixed,
    default: {}
  }
},
{toObject: {
  getters: true,
  virtuals: true
}});

settingSchema.virtual('adThreads')
  .get(function() {
    return this._adThreads;
  })
  .set(function(ads) {
    this._adThreads = ads;
  });

async function operateSystemID(type, op) {
  const SettingModel = mongoose.model('settings');
  if(op !== 1 && op !== -1) throw 'invalid operation. a operation should be -1 or 1';
  const q = {
    $inc: {}
  };
  q.$inc[`c.${type}`] = op;
  const setting = await SettingModel.findOneAndUpdate({_id: 'counters'}, q);
  if(!setting) throw 'counters settings not found';
  if(setting.c[type] === undefined) {
    setting.c[type] = 1;
    const obj = {
      $set: {}
    };
    obj.$set[`c.${type}`] = 1;
    await setting.update(obj);
  } else {
    setting.c[type] += op;
  }
  return setting.c[type];
}

settingSchema.statics.operateSystemID = operateSystemID;

settingSchema.statics.newObjectId = () => {
  return mongoose.Types.ObjectId();
};

settingSchema.methods.extend = async function() {
  const ThreadModel = require('./ThreadModel');
  const PostModel = require('./PostModel');
  let ads = this.ads;
  for (let i = 0; i < ads.length; i++) {
    const thread = await ThreadModel.findOnly({tid: ads[i]});
    const post = await PostModel.findOnly({pid: thread.oc});
    ads[i] = Object.assign(thread, {post});
  }
  const targetSetting = this.toObject();
  targetSetting.ads = ads;
  return targetSetting;
};

settingSchema.methods.extendAds = async function() {
  const ThreadModel = require('./ThreadModel');
  const adThreads = await Promise.all(this.ads.map(async tid => {
    const thread = await ThreadModel.findOnly({tid});
    await thread.extendFirstPost();
    return thread;
  }));
  return this.adThreads = adThreads;
};
/*
  通过系统设置的ID查找数据
  @return setting
  @author pengxiguaa 2019/3/7
*/
settingSchema.statics.findById = async (_id) => {
  const SettingModel = mongoose.model('settings');
  const setting = await SettingModel.findOne({_id});
  if(!setting) throwErr(404, `未找到ID为【${_id}】的系统设置`);
  return setting;
};

/*
* 通过ID查找设置 返回settings.c
* @param {String} _id
* */
settingSchema.statics.getSettings = async (_id) => {
  let settings = await redisClient.getAsync(`settings:${_id}`);
  if(!settings) {
    settings = await mongoose.model("settings").saveSettingsToRedis(_id);
  } else {
    settings = JSON.parse(settings);
  }
  return settings.c;
};
settingSchema.statics.saveSettingsToRedis = async (_id) => {
  const SettingModel = mongoose.model("settings");
  const settings = await SettingModel.findOne({_id});
  if(settings) {
    setTimeout(async () => {
      await redisClient.setAsync(`settings:${_id}`, JSON.stringify(settings));
    });
  }
  return settings;
};

/*
* 检查号码是否受限
* @param {String} code
* @param {String} number
* */
settingSchema.statics.checkRestricted = async (code, number) => {
  const c = await mongoose.model("settings").getSettings('sms');
  for(const ele of c.restrictedNumber) {
    if (ele.code.split(' ')[1] === code) {
      ele.number.map(n => {
        const index = number.indexOf(n);
        if(index === 0) throwErr(403, "此号码受限制");
      });
    }
  }
};
/*
* 检测手机号是否受限制、是否已被绑定、使用次数是否超过限制
* @param {String} nationCode 国际区号
* @param {String} mobile 手机号码
* @author pengxiguaa 2020-3-6
* */
settingSchema.statics.checkMobile = async (nationCode, mobile, uid) => {
  const SettingModel = mongoose.model("settings");
  await SettingModel.checkRestricted(nationCode, mobile);
  const regSettings = await SettingModel.getSettings("register");
  const UsersPersonalModel = mongoose.model("usersPersonal");
  const SecretBehaviorModel = mongoose.model("secretBehaviors");
  const {mobileCountLimit} = regSettings;
  const used = await UsersPersonalModel.count({nationCode, mobile});
  if(used) throwErr(403, "此号码已被其他账号绑定");
  const secretBehaviors = await SecretBehaviorModel.find({
    $or: [
      {
        oldMobile: mobile,
        oldNationCode: nationCode
      },
      {
        newMobile: mobile,
        newNationCode: nationCode
      }
    ]
  }, {uid: 1});
  const usersId = new Set(secretBehaviors.map(s => s.uid));
  if(!usersId.has(uid) && usersId.size >= mobileCountLimit) throwErr(403, `为了净化网络生态，每个手机号只能使用${mobileCountLimit}次，使用次数已用尽。`);
};
/*
* 检测邮箱是否已被绑定、使用次数是否超过限制
* @param {String} email
* @author pengxiguaa 2020-3-6
* */
settingSchema.statics.checkEmail = async (email, uid) => {
  const {checkEmail} = require("../nkcModules/checkData");
  checkEmail(email);
  const UsersPersonalModel = mongoose.model("usersPersonal");
  const SecretBehaviorModel= mongoose.model("secretBehaviors");
  const SettingModel = mongoose.model("settings");
  const {emailCountLimit} = await SettingModel.getSettings("register");
  const used = await UsersPersonalModel.count({email});
  if(used) throwErr(403, "此邮箱已被其他账号绑定");
  const secretBehaviors = await SecretBehaviorModel.find({
    $or: [
      {
        oldEmail: email
      },
      {
        newEmail: email
      }
    ]
  }, {uid: 1});
  const usersId = new Set(secretBehaviors.map(s => s.uid));
  if(!usersId.has(uid) && usersId.size >= emailCountLimit) throwErr(403, `为了净化网络生态，每个邮箱只能使用${emailCountLimit}次，使用次数已用尽。`);
};
/*
  根据用户的证书以及等级 获取用户与下载相关的设置
  @param {Schema Object} user 用户对象
*/
settingSchema.statics.getDownloadSettingsByUser = async (user) => {
  const SettingModel = mongoose.model("settings");
  const {options} = await SettingModel.getSettings("download");
  let fileCountOneDay = 0, speed = 1;
  const optionsObj = {};
  for(const o of options) {
    optionsObj[`${o.type}_${o.id}`] = o;
  }
  if(!user) {
    const option = optionsObj[`role_visitor`];
    fileCountOneDay = option.fileCountOneDay;
    speed = option.speed;
  } else {
    if(!user.roles) {
      await user.extendRoles();
    }
    if(!user.grade) {
      await user.extendGrade();
    }
    for(const role of user.roles) {
      const option = optionsObj[`role_${role._id}`];
      if(!option) continue;
      if(fileCountOneDay < option.fileCountOneDay) {
        fileCountOneDay = option.fileCountOneDay;
      }
      if(speed < option.speed) {
        speed = option.speed;
      }
    }
    const gradeOption = optionsObj[`grade_${user.grade._id}`];
    if(gradeOption) {
      if(fileCountOneDay < gradeOption.fileCountOneDay) {
        fileCountOneDay = gradeOption.fileCountOneDay;
      }
      if(speed < gradeOption.speed) {
        speed = gradeOption.speed;
      }
    }
  }
  return {
    speed,
    fileCountOneDay
  }
};

/*
* 获取水印透明度
* @return {Number} 水印透明度
* @author pengxiguaa 2020/6/17
* */
settingSchema.statics.getWatermarkSettings = async () => {
  const SettingModel = mongoose.model('settings');
  const uploadSettings = await SettingModel.getSettings('upload');
  return {
    transparency: 255 * (1 - uploadSettings.watermark.transparency / 100),
    enabled: uploadSettings.watermark.enabled,
    minHeight: uploadSettings.watermark.minHeight,
    minWidth: uploadSettings.watermark.minWidth
  }
};

/*
* 获取启用的积分ID
* */
settingSchema.statics.getEnabledScores = async () => {
  const SettingModel = mongoose.model('settings');
  const scoreSettings = await SettingModel.getSettings('score');
  const {scores} = scoreSettings;
  const types = [];
  for(let i = 1; i <= 5; i++) {
    const scoreType = `score${i}`;
    if(scores[scoreType].enabled) {
      types.push({
        type: scoreType,
        name: scores[scoreType].name,
        unit: scores[scoreType].unit
      });
    }
  }
  return types;
};
/*
* 获取全部积分
* @return {[Object]} 所有的积分对象，只包含type、name、unit属性
* */
settingSchema.statics.getScores = async () => {
  const SettingModel = mongoose.model("settings");
  const scoreSettings = await SettingModel.getSettings('score');
  const {scores} = scoreSettings;
  const types = [];
  for(let i = 1; i <= 5; i++) {
    const scoreType = `score${i}`;
    types.push({
      type: scoreType,
      name: scores[scoreType].name,
      unit: scores[scoreType].unit
    })
  }
  return types;
};
/*
* 获取交易积分
* @return {Object} 积分对象
* @author pengxiguaa 2020/6/24
* */
settingSchema.statics.getMainScore = async () => {
  const SettingModel = mongoose.model('settings');
  const scoreSettings = await SettingModel.getSettings('score');
  return scoreSettings.scores.score1;
};

/*
* 获取指定type的积分对象
* @param {String} type 积分类型
* @return {Object} 积分对象
* @author pengxiguaa 2020/6/30
* */
settingSchema.statics.getScoreByScoreType = async (type) => {
  const SettingModel = mongoose.model('settings');
  const scoreSettings = await SettingModel.getSettings('score');
  if(!['score1', 'score2', 'score3', 'score4', 'score5'].includes(type)) throwErr(500, '积分类型错误');
  return scoreSettings.scores[type];
}

/*
* 获取积分银行名称
* @return {String} 积分银行名称
* @author pengxiguaa 2020/6/29
* */
settingSchema.statics.getNKCBankName = async () => {
  const SettingModel = mongoose.model('settings');
  const scoreSettings = await SettingModel.getSettings('score');
  return scoreSettings.nkcBankName;
}

/*
* 获取充值设置
* @return {Object} 充值设置
* @author pengxiguaa 2020/6/29
* */
settingSchema.statics.getRechargeSettings = async () => {
  const SettingModel = mongoose.model('settings');
  const rechargeSettings = await SettingModel.getSettings('recharge');
  return rechargeSettings.recharge;
};
/*
* 获取提现设置
* @return {Object} 提现设置
* @author pengxiguaa 2020/6/29
* */
settingSchema.statics.getWithdrawSettings = async () => {
  const SettingModel = mongoose.model('settings');
  const rechargeSettings = await SettingModel.getSettings('recharge');
  return rechargeSettings.withdraw;
};

/*
* 获取指定操作使用的积分类型
* @param {String} type
*   postRewardScore: 随机红包,
*   digestRewardScore: 精选红包,
*   shareRewardScore: 分享奖励
*   watermarkScore: 去水印
*   usernameScore: 修改用户名
*   shopScore: 商品交易
*   creditScore: 鼓励
*   attachmentScore: 附件下载
* */
settingSchema.statics.getScoreByOperationType = async (type) => {
  const SettingModel = mongoose.model('settings');
  if(![
    'postRewardScore',
    'digestRewardScore',
    'shareRewardScore',
    'waterRewardScore',
    'watermarkScore',
    'usernameScore',
    'shopScore',
    'creditScore',
    'attachmentScore'
  ].includes(type)) throwErr(500, `未知的操作类型 type: ${type}`);
  const scoreSettings = await SettingModel.getSettings('score');
  const scoreName = scoreSettings[type];
  return scoreSettings.scores[scoreName];
};

/*
* 获取鼓励限制
* @return {Object} min: 最小值, max: 最大值
* @author pengxiguaa 2020/6/29
* */
settingSchema.statics.getCreditSettings = async () => {
  const SettingModel = mongoose.model('settings');
  const scoreSettings = await SettingModel.getSettings('score');
  return {
    min: scoreSettings.creditMin,
    max: scoreSettings.creditMax
  };
};
/*
* 获取指定的积分操作类型对象，用于积分加减计算
* @param {String} type 操作名
* @return {Object} 与此操作相关的积分设置，包含周期、次数等
* @author pengxiguaa 2020/6/30
* */
settingSchema.statics.getScoreOperationByType = async (type) => {
  const SettingModel = mongoose.model('settings');
  const scoreSettings = await SettingModel.getSettings('score');
  let operation;
  for(const o of scoreSettings.operations) {
    if(o.type === type) {
      operation = o;
      break;
    }
  }
  if(!operation) throwErr(500, '积分操作类型错误');
  return operation;
};
module.exports = mongoose.model('settings', settingSchema);
