const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  type: {
    type: String,
    required: 1,
    index: 1
  },
  uid: {
    type: String,
    default: '',
    index: 1
  },
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
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  c: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  }
}, {
  collection: 'verifications'
});

/*
* 验证是否被使用过、或者是否超时
* */
schema.methods.verifyBaseInfo = async function() {
  if(this.disabled) throwErr(400, '验证失败');
  const timeout = 30 * 1000;
  let errorStr;
  if(Date.now() - this.toc > timeout) {
    errorStr = '验证失败';
  }
  await this.update({disabled: true});
  if(errorStr) throwErr(400, errorStr);
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
  const data = verifications[type].create();
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
* 验证数据
* */
schema.statics.verifyData = async (verificationData) => {
  const VerificationModel = mongoose.model('verifications');
  const verifications = require('../nkcModules/verification');
  const verification = await VerificationModel.findOne({
    _id: verificationData._id,
    type: verificationData.type
  });
  if(!verification) throwErr(400, '验证失败');
  await verification.verifyBaseInfo();
  if(!verifications[verification.type].verify(verificationData, verification.c)) {
    throwErr(400, `验证失败`);
  }
}

module.exports = mongoose.model('verifications', schema);
