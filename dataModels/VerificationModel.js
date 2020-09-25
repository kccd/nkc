// 原始信息的过期时间 ms
const baseInfoTimeout = 60 * 1000;
// 加密串过期时间 ms
const secretTimeout = 2 * 60 * 1000;

const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  // 验证的类型
  type: {
    type: String,
    required: 1,
    index: 1
  },
  // 获取验证的用户ID
  uid: {
    type: String,
    default: '',
    index: 1
  },
  // 获取验证的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  ip: {
    type: String,
    default: '',
    index: 1,
  },
  port: {
    type: String,
    default: '',
  },
  // 是否已经对比过原始数据
  used: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 是否已经使用过验证通过后的加密串
  secretUsed: {
    type: Boolean,
    default: false,
    index: 1
  },
  secret: {
    type: String,
    index: 1,
    default: ''
  },
  c: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  }
}, {
  collection: 'verifications'
});

/*
* 抛出验证失败的错误
* */
schema.statics.throwFailedError = async (message = '验证失败') => {
  throwErr(400, message);
};

/*
* 验证原始信息通过后生成加密串
* */
schema.statics.newSecret = async () => {
  const apiFunction = require('../nkcModules/apiFunction');
  const secret = apiFunction.getRandomString('aA0', 64);
  const VerificationModel = mongoose.model('verifications');
  const v = await VerificationModel.count({secret});
  if(v !== 0) {
    return await VerificationModel.newSecret();
  } else {
    return secret;
  }
};

/*
* 验证是否被使用过、或者是否超时
* */
schema.methods.verifyBaseInfo = async function() {
  const VerificationModel = mongoose.model('verifications');
  if(this.used) await VerificationModel.throwFailedError();
  let errorStr;
  if(Date.now() - this.toc > baseInfoTimeout) {
    errorStr = '验证失败';
  }
  await this.update({used: true});
  if(errorStr) await VerificationModel.throwFailedError();
};


/*
* 随机获取验证数据
* @param {Object} options
*   @param {String} uid 用户ID
*   @param {String} ip
*   @param {String} port
* @return {Object}
*   @param {String} type 验证类型
*   @param {Object} 验证类型对应的相关数据
* @author pengxiguaa 2020-9-24
* */
schema.statics.getVerificationData = async (options) => {
  const verifications = require('../nkcModules/verification');
  const types = Object.keys(verifications);
  const type = types[Math.round(Math.random() * (types.length - 1))];
  const VerificationModel = mongoose.model('verifications');
  const data = await verifications[type].create();
  const {uid, ip, port} = options;
  const SettingModel = mongoose.model('settings');
  const verification = VerificationModel({
    _id: SettingModel.newObjectId(),
    type,
    uid,
    ip,
    port,
    c: data
  });
  await verification.save();
  delete data.answer;
  data.type = type;
  data._id = verification._id;
  return data;
}

/*
* 验证原始数据
* */
schema.statics.verifyData = async (verificationData) => {
  const VerificationModel = mongoose.model('verifications');
  const verifications = require('../nkcModules/verification');
  const {_id, type, uid, ip} = verificationData;
  const verification = await VerificationModel.findOne({
    _id, type, uid, ip
  });
  if(!verification) await VerificationModel.throwFailedError();
  await verification.verifyBaseInfo();
  if(!verifications[verification.type].verify(verificationData, verification.c)) {
    await VerificationModel.throwFailedError();
  }
  // 生成加密串
  const secret = await VerificationModel.newSecret();
  await verification.update({secret});
  return secret;
}


/*
* 验证加密串
* */
schema.statics.verifySecret = async (options) => {
  const VerificationModel = mongoose.model('verifications');
  const {uid, ip, secret} = options;
  const verification = await VerificationModel.findOne({
    uid, ip, secret
  });
  if(!verification) await VerificationModel.throwFailedError();
  if(verification.secretUsed) await VerificationModel.throwFailedError();
  if(Date.now() - verification.toc > secretTimeout) await VerificationModel.throwFailedError();
  await verification.update({secretUsed: true});
}

module.exports = mongoose.model('verifications', schema);
