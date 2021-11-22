const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const redisClient = require('../settings/redisClient');
const ei = require('easyimage');
const FILE = require("../nkcModules/file");
const PATH = require("path");
const fs = require("fs");
const statics = require("../settings/statics");
const destroy = require("destroy");
const fsPromise = fs.promises;

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
    await setting.updateOne(obj);
  } else {
    setting.c[type] += op;
  }
  return setting.c[type];
}

settingSchema.statics.operateSystemID = operateSystemID;

settingSchema.statics.newObjectId = () => {
  return mongoose.Types.ObjectId();
};

settingSchema.statics.getNewId = () => {
  return mongoose.Types.ObjectId().toString();
}

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
    await redisClient.setAsync(`settings:${_id}`, JSON.stringify(settings));
  }
  return settings;
};
/*
* 将所有后台设置缓存到redis
* @author pengxiguaa 2020/7/31
* */
settingSchema.statics.saveAllSettingsToRedis = async () => {
  const SettingModel = mongoose.model('settings');
  const settings = await SettingModel.find();
  for(const setting of settings) {
    const {_id} = setting;
    await redisClient.setAsync(`settings:${_id}`, JSON.stringify(setting));
  }
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
  const used = await UsersPersonalModel.countDocuments({nationCode, mobile});
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
  const used = await UsersPersonalModel.countDocuments({email});
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
  @author pengxiguaa 2020-9-28
*/
settingSchema.statics.getDownloadSettingsByUser = async (user) => {
  const SettingModel = mongoose.model("settings");
  const {speed: settingsSpeed} = await SettingModel.getSettings("download");
  let speed;
  const hour = new Date().getHours();
  const optionsObj = {};
  for(const o of settingsSpeed.others) {
    optionsObj[o.type] = o;
  }

  const getSpeedByHour = (arr) => {
    for(const t of arr) {
      const {startingTime, endTime, speed} = t;
      if(startingTime < endTime) {
        if(hour >= startingTime && hour < endTime) {
          return speed;
        }
      } else {
        if(hour >= startingTime || hour < endTime) {
          return speed;
        }
      }

    }
    return 0;
  };

  if(!user) {
    const option = optionsObj[`role-visitor`];
    if(option) {
      speed = getSpeedByHour(option.data);
    }
  } else {
    if(!user.roles) {
      await user.extendRoles();
    }
    if(!user.grade) {
      await user.extendGrade();
    }
    for(const role of user.roles) {
      const option = optionsObj[`role-${role._id}`];
      if(!option) continue;
      const _speed = getSpeedByHour(option.data);
      if(speed === undefined || speed < _speed) {
        speed = _speed;
      }
    }
    const gradeOption = optionsObj[`grade-${user.grade._id}`];
    if(gradeOption) {
      const _speed = getSpeedByHour(gradeOption.data);
      if(speed === undefined || speed < _speed) {
        speed = _speed;
      }
    }
  }
  if(speed === undefined) {
    speed = getSpeedByHour(settingsSpeed.default.data);
  }
  const fileCountLimitInfo = await SettingModel.getDownloadFileCountLimitInfoByUser(user);
  let fileCountLimit;
  for(const f of fileCountLimitInfo) {
    const {startingTime, endTime} = f;
    if(startingTime < endTime) {
      if(hour >= startingTime && hour < endTime) {
        fileCountLimit = f;
        break;
      }
    } else {
      if(hour >= startingTime || hour < endTime) {
        fileCountLimit = f;
        break;
      }
    }

  }
  if(!fileCountLimit) throwErr(500, `后台数量限制配置错误，请通过页脚的「报告问题」告知管理员`);
  return {
    speed,
    fileCountOneDay: fileCountLimit.fileCount,
    fileCountLimit
  }
};



/*
* 获取用户分时段下载附件的信息
* @param {Object} user 用户对象
* @author pengxiguaa 2020-9-29
* */
settingSchema.statics.getDownloadFileCountLimitInfoByUser = async (user) => {
  const SettingModel = mongoose.model("settings");
  const {fileCountLimit} = await SettingModel.getSettings("download");
  const {default: settingsDefault, others, roles} = fileCountLimit;

  // 判断证书
  if(user) {
    if(!user.roles) {
      await user.extendRoles();
    }
    const rolesObj = {};
    roles.map(role => rolesObj[role.type] = role);
    let fileCount;
    for(const role of user.roles) {
      const r = rolesObj[`role-${role._id}`];
      if(!r) continue;
      if(fileCount === undefined || fileCount < r.fileCount) {
        fileCount = r.fileCount;
      }
    }
    if(fileCount !== undefined) {
      return [
        {
          startingTime: 0,
          endTime: 24,
          fileCount,
        }
      ];
    }
  }

  // 用户等级判断
  let optionType;
  if(!user) {
    optionType = `role-visitor`;
  } else {
    if(!user.grade) {
      await user.extendGrade();
    }
    optionType = `grade-${user.grade._id}`;
  }
  let option;
  for(const o of others) {
    if(o.type !== optionType) continue;
    option = o;
  }
  if(!option) {
    option = settingsDefault;
  }
  return option.data;
};

/*
* 保存用户水印
* */
settingSchema.statics.saveWatermark = async (file, c = 'normal') => {
  if(!['normal', 'small'].includes(c)) throwErr(400, '未知的水印类型');
  const FILE = require("../nkcModules/file");
  const ext = await FILE.getFileExtension(file, ['jpg', 'png', 'jpeg']);
  const attachmentsModel = mongoose.model('attachments');
  const settingsModel = mongoose.model('settings');
  const toc = new Date();
  const fileFolder = await FILE.getPath('watermark', toc);
  const aid = attachmentsModel.getNewId();
  const fileName = `${aid}.${ext}`;
  const realPath = PATH.resolve(fileFolder, `./${fileName}`);
  const {path, size, name, hash} = file;
  await fsPromise.copyFile(path, realPath);
  const attachment = attachmentsModel({
    _id: aid,
    toc,
    size,
    hash,
    name,
    ext,
    c,
    type: 'watermark',
  });
  await attachment.save();
  const obj = {};
  obj[`c.watermark.${c}AttachId`] = aid;
  await settingsModel.updateOne({_id: 'upload'}, {
    $set: obj
  });
  await settingsModel.saveSettingsToRedis('upload');
  return attachment;
}

/*
* 获取水印图片路径
* @return {String} 磁盘路径
* */
settingSchema.statics.getWatermarkFilePath = async (c, type) => {
  if(!['normal', 'small'].includes(c)) throwErr(400, '未知的水印类型');
  if(type === 'picture') {
    if(!await FILE.access(statics[`${c}PictureWatermark`])) {
      return statics[`${c}Watermark`];
    }
    return statics[`${c}PictureWatermark`];
  } else {
    if(!await FILE.access(statics[`${c}VideoWatermark`])) {
      return statics[`${c}Watermark`];
    }
    return statics[`${c}VideoWatermark`];
  }
  //判断如果用户未上传水印图片就换未默认图片
  /*if(!id) {
    return statics[`${c}Watermark`];
  }
  //判断如果用户上传了图片根据id找不到图片就替换为默认图片
  if(water == null){
    return statics[`${c}Watermark`];
  }
  //判断如果用户上传了图片找不到图片路径就替换为默认图片
  if(!filePath){
    return statics[`${c}Watermark`];
  }
  return filePath;*/
}

/*
* 获取水印透明度
* @return {Number} 水印透明度
* @author pengxiguaa 2020/6/17
* */
settingSchema.statics.getWatermarkSettings = async (type) => {
  const SettingModel = mongoose.model('settings');
  const uploadSettings = await SettingModel.getSettings('upload');
  return {
    // transparency: 255 * (1 - uploadSettings.watermark.transparency / 100),
    transparency: type === 'video'? 100 - uploadSettings.watermark.video.transparency: 100 - uploadSettings.watermark.picture.transparency,
    enabled: type === 'video'? uploadSettings.watermark.video.enabled:uploadSettings.watermark.picture.enabled,
    minHeight: type === 'video'?uploadSettings.watermark.video.minHeight:uploadSettings.watermark.picture.minHeight,
    minWidth: type === 'video'?uploadSettings.watermark.video.minWidth:uploadSettings.watermark.picture.minWidth,
  }
};

/*
* 获取启用的积分对象
* @return {[Object]} 积分对象
* @author pengxiguaa 2020/7/2
* */
settingSchema.statics.getEnabledScores = async () => {
  const SettingModel = mongoose.model('settings');
  const scores = await SettingModel.getScores();
  const _scores = [];
  for(const score of scores) {
    if(score.enabled) _scores.push(score);
  }
  return _scores;
};

/**
 * 获取启用的积分类型名数组
 * @returns {string[]} 积分类型名数组  ["score1", "score2" ... ]
 */
settingSchema.statics.getEnabledScoresType = async () => {
  let scores = await settingSchema.statics.getEnabledScores();
  return scores.map(score => {
    return score.type;
  });
};

/*
* 获取全部积分
* @return {[Object]} 所有的积分对象
* @author pengxiguaa 2020/7/2
* */
settingSchema.statics.getScores = async () => {
  const SettingModel = mongoose.model("settings");
  const scoreSettings = await SettingModel.getSettings('score');
  return scoreSettings.scores;
};
/*
* 获取全部积分类型
* @return {[String]} 积分类型组成的数组
* @author pengxiguaa 2020/7/2
* */
settingSchema.statics.getScoresType = async () => {
  const SettingModel = mongoose.model('settings');
  const scores = await SettingModel.getScores();
  return scores.map(s => s.type);
};
/*
* 获取交易积分
* @return {Object} 积分对象
* @author pengxiguaa 2020/6/24
* */
settingSchema.statics.getMainScore = async () => {
  const SettingModel = mongoose.model('settings');
  const scores = await SettingModel.getScores();
  return scores[0];
};

/*
* 获取指定type的积分对象
* @param {String} type 积分类型
* @return {Object} 积分对象
* @author pengxiguaa 2020/6/30
* */
settingSchema.statics.getScoreByScoreType = async (type) => {
  const SettingModel = mongoose.model('settings');
  const scoresType = await SettingModel.getScoresType();
  if(!scoresType.includes(type)) throwErr(500, `积分类型错误 type: ${type}`);
  const scores = await SettingModel.getScores();
  for(const score of scores) {
    if(score.type === type) {
      return score;
    }
  }
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
    'attachmentScore',
    'surveyRewardScore',
  ].includes(type)) throwErr(500, `未知的操作类型 type: ${type}`);
  const scoreSettings = await SettingModel.getSettings('score');
  const scoreType = scoreSettings[type];
  return await SettingModel.getScoreByScoreType(scoreType);
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
* 获取指定的积分操作类型对象，用于积分加减计算，此方法取出的是后台积分策略（非专业）
* @param {String} type 操作名
* @return {Object} 与此操作相关的积分设置，包含周期、次数等
* @author pengxiguaa 2020/6/30
* */
settingSchema.statics.getDefaultScoreOperationByType = async (type) => {
  const ScoreOperationModel = mongoose.model('scoreOperations');
  const scoreOperation = await ScoreOperationModel.findOne({
    from: 'default',
    type,
  });
  if(!scoreOperation) throwErr(400, `未找到指定的默认积分策略 type: ${type}`);
  return scoreOperation;
};

/*
* 指定类型和专业id数组，获取积分策略对象
* @param {String} type 操作名
* @param {String} forumId 专业id
* @return {[Object]} 积分策略对象组成的数组
* */
settingSchema.statics.getScoreOperationsByType = async (type, fid = '') => {
  const ScoreOperationModel = mongoose.model('scoreOperations');
  const SettingModel = mongoose.model('settings');
  let scoreOperation;
  if(fid) {
    scoreOperation = await ScoreOperationModel.findOne({
      type,
      from: 'forum',
      fid
    });
  }
  if(!scoreOperation) {
    scoreOperation = await SettingModel.getDefaultScoreOperationByType(type);
  }
  if(scoreOperation.count !== 0) return scoreOperation;
};
/*
* 获取所有默认积分策略操作对象
* @return {[Object]} 默认策略操作对象
* @author pengxiguaa 2020/7/2
* */
settingSchema.statics.getDefaultScoreOperations = async () => {
  const ScoreOperationModel = mongoose.model('scoreOperations');
  return await ScoreOperationModel.find({
    from: 'default'
  }).sort({toc: 1});
};
/*
* 获取所有专业配置的积分策略操作对象
* @return {[Object]} 积分策略操作对象
* @author pengxiguaa 2020/7/2
* */
settingSchema.statics.getForumAvailableScoreOperations = async () => {
  const ScoreOperationModel = mongoose.model('scoreOperations');
  const operations = await ScoreOperationModel.find({
    forumAvailable: true,
    from: 'default'
  }).sort({toc: 1});
  return operations.map(o => o.toObject());
};
/*
* 获取专业已配置的积分策略操作对象
* @param {String} fid 专业ID
* @return {[Object]} 积分策略操作对象
* @author pengxiguaa 2020/7/2
* */
settingSchema.statics.getForumScoreOperations = async (fid) => {
  const ScoreOperationModel = mongoose.model('scoreOperations');
  return await ScoreOperationModel.find({
    from: 'forum',
    fid
  })
    .sort({toc: 1});
};

/*
* 获取回收站专业ID
* @return {String} 专业ID
* @author pengxiguaa 2020/7/31
* */
settingSchema.statics.getRecycleId = async () => {
  const SettingModel = mongoose.model('settings');
  const forumSettings = await SettingModel.getSettings('forum');
  return forumSettings.recycle;
}
/*
* 判断指定fid的专业是否为回收站
* @param {String} fid 专业ID
* @return {Boolean} 是否为回收站
* @author pengxiguaa 2020/7/31
* */
settingSchema.statics.isRecycle = async (fid) => {
  const SettingModel = mongoose.model('settings');
  const recycleId = await SettingModel.getRecycleId();
  return fid === recycleId;
};

/*
* 检测卖家是否活跃，不允许用户购买长时间未活动的用户的商品
* @param {String} userId 用户ID
* */
settingSchema.statics.checkShopSellerByUid = async (uid) => {
  const SettingModel = mongoose.model('settings');
  const UserModel = mongoose.model('users');
  const shopSettings = await SettingModel.getSettings('shop');
  const user = await UserModel.findOnly({uid});
  const _time = Date.now() - (shopSettings.closeSale.lastVisitTime * 24 * 60 * 60 * 1000);
  if(_time > user.tlv) {
    throwErr(403, shopSettings.closeSale.description);
  }
};

/*
* 获取指定尺寸视频的比特率
* @param {Number} width
* @param {Number} height
* @return {Number} 比特率 单位Kbps
* @author pengxiguaa 2020
* */
settingSchema.statics.getBitrateBySize = async (width, height) => {
  const SettingModel = mongoose.model('settings');
  const uploadSettings = await SettingModel.getSettings('upload');
  const s = width * height;
  const {configs, defaultBV} = uploadSettings.videoVBRControl;
  let rate;
  for(const v of configs) {
    const {bv, from, to} = v;
    if(s >= from && s < to) {
      rate = bv;
      break
    }
  }
  if(!rate) {
    rate = defaultBV;
  }
  return rate * 1024;
}

/*
* 获取视频尺寸信息
* */
settingSchema.statics.getVideoSize = async function() {
  const videoSize = {
    sd: {
      height: 480,
      fps: 30,
    },
    hd: {
      height: 720,
      fps: 30,
    },
    fhd: {
      height: 1080,
      fps: 30,
    }
  };
  return videoSize;
}

/*
* 获取用户水印图片
* @param {String} uid
* @return {Object || null} 不打水印返回null
*   @param {String} waterGravity 水印位置
*     southeast: 右下角
*     northeast: 右上角
*     southwest: 左下角
*     northwest: 左上角
*     center: 正中间
*   @param {Stream} watermarkStream 水印数据流
* @author pengxiguaa 2021-01-22
* */
settingSchema.statics.getWatermarkCoverPathByUid = async (uid, type) => {
  const SettingModel = mongoose.model('settings');
  const ColumnsModel = mongoose.model('columns');
  const UserModel = mongoose.model('users');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  if(!['picture', 'video'].includes(type)) throwErr(500, `watermark type error`);
  const waterSetting = await UsersGeneralModel.findOnly({uid: uid}, {waterSetting: 1});
  const {
    waterAdd
  } = waterSetting.waterSetting;
  const watermarkSettings = await  SettingModel.getWatermarkSettings(type);
  if(!waterAdd || !watermarkSettings.enabled) return null;
  let imagePath = '', text = '';
  if(waterSetting.waterSetting[type].waterStyle === 'siteLogo') {
    imagePath = await SettingModel.getWatermarkFilePath('normal', type);
  } else if(waterSetting.waterSetting[type].waterStyle === 'singleLogo') {
    imagePath = await SettingModel.getWatermarkFilePath('small', type);
  } else if (waterSetting.waterSetting[type].waterStyle === 'coluLogo') {
    imagePath = await SettingModel.getWatermarkFilePath('small', type);
    const column = await ColumnsModel.findOne({uid: uid}, {name: 1, uid: 1})
    const user = await UserModel.findOnly({uid}, {username: 1, uid: 1});
    text = column.name === ''? user.username:column.name;
  } else {
    imagePath = await SettingModel.getWatermarkFilePath('small', type);
    const user = await UserModel.findOnly({uid}, {username: 1, uid: 1});
    text = user.username === ''? `KCID:${user.uid}`:user.username;
  }
  return await SettingModel.getWatermarkCoverPath(
    imagePath,
    text,
    watermarkSettings.transparency / 100
  );
}

settingSchema.statics.getWatermarkCoverPath = async (magePath, text = '', transparent = 1) => {
  const {getFileMD5, getTextMD5} = require('../nkcModules/hash');
  const FILE = require('../nkcModules/file');
  const createWatermark = require('../nkcModules/createWatermark');
  const {watermarkCache} = require("../settings/upload");
  const md5 = await getFileMD5(magePath) + await getTextMD5(text + transparent);
  const watermarkPath = PATH.resolve(watermarkCache, `${md5}.png`);
  if(await FILE.access(watermarkPath)) {
    console.log(`存在水印`);
    return watermarkPath;
  }
  console.log(`开始生成水印...`);
  const watermarkStream = await createWatermark(magePath, text, transparent);
  console.log(`水印已生成`);
  const file = fs.createWriteStream(watermarkPath);
  const func = () => {
    return new Promise((resolve, reject) => {
      const destroyStream = () => {
        destroy(watermarkStream);
        destroy(file);
      };
      file.on('finish', () => {
        resolve(watermarkPath);
        destroyStream();
      });
      file.on('error', err => {
        reject(err);
        destroyStream();
      });
      watermarkStream.pipe(file);
    });
  };
  return await func();
}

/*
* 判断用户阅读指定时间的内容时是否受到限制
* @param {Date} toc 内容发表时间
* @param {[String]} userRolesId 用户拥有的证书
* @param {[Number]} userGradeId 用户的等级
* @param {Boolean} isAuthor 是否为内容作者
* @author pengxiguaa 2021-4-26
* */
settingSchema.statics.restrictAccess = async (props) => {
  const {
    toc,
    isAuthor = false,
    forums = [],
    userRolesId,
    userGradeId,
  } = props;
  const throwError = require('../nkcModules/throwError');
  const nkcRender = require('../nkcModules/nkcRender');
  const SettingModel = mongoose.model('settings');
  const threadSettings = await SettingModel.getSettings('thread');
  const disablePostData = [];
  if(forums.length === 0) {
    disablePostData.push(threadSettings.disablePost);
  }
  for(const forum of forums) {
    const {status} = forum.disablePost;
    const disablePost = status === 'inherit'? threadSettings.disablePost: forum.disablePost;
    if(!disablePostData.includes(disablePost)) {
      disablePostData.push(disablePost);
    }
  }

  for(const disablePost of disablePostData) {
    const {status, errorInfo, time, rolesId, gradesId, allowAuthor} = disablePost;
    if(status === false || status === 'off') continue; // 未开启
    const settingTime = new Date(`${time} 00:00:00`).getTime();
    const inputTime = toc.getTime();
    if(inputTime >= settingTime) continue;
    if(gradesId.includes(userGradeId)) continue;
    const existRolesId = userRolesId.filter(userRoleId => rolesId.includes(userRoleId));
    if(existRolesId.length > 0) continue;
    if(isAuthor && allowAuthor) continue;
    throwError(451, {errorInfo: nkcRender.plainEscape(errorInfo), errorStatus: '451 Unavailable For Legal Reasons'}, 'simpleErrorPage');
  }
}

/**
 * 获取首页大Logo
 */
settingSchema.statics.getHomeBigLogo = async () => {
  const SettingModel = mongoose.model('settings');
  const homeSettings = await SettingModel.getSettings('home');
  if(!homeSettings.homeBigLogo || !(homeSettings.homeBigLogo.length)) {
    return [];
  } else {
    return homeSettings.homeBigLogo;
  }
}


/*
* 更换网站 logo
* */
settingSchema.statics.saveSiteLog = async (filePath) => {
  const {
    logoICO,
    logoSM,
    logoMD,
    logoLG
  } = require('../settings/statics');
  // 生成ico图标
  await ei.resize({
    src: filePath,
    dst: logoICO,
    height: 96,
    width: 96,
  });
  // 生成小logo
  await ei.resize({
    src: filePath,
    dst: logoSM,
    height: 128,
    width: 128
  });
  // 生成中等logo
  await ei.resize({
    src: filePath,
    dst: logoMD,
    height: 256,
    width: 256,
  });
  // 生成中等logo
  await ei.resize({
    src: filePath,
    dst: logoLG,
    height: 512,
    width: 512,
  });
}

module.exports = mongoose.model('settings', settingSchema);
