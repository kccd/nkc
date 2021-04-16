const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  ip: {
    type: String,
    default: ''
  },
  port: {
    type: String,
    default: ''
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
  originPhoneNumber: {
    type: String,
    required: true,
    index: 1
  },
  originNationCode: {
    type: String,
    required: true,
    index: 1
  },
  phoneNumber: {
    type: String,
    required: true,
    index: 1
  },
  nationCode: {
    type: String,
    required: true,
    index: 1
  },
  passed: {
    type: Boolean,
    required: true,
    index: 1
  }
}, {
  collection: 'VerificationRecords'
});


/*
* 验证用户手机号是否正确
* @param {Object} props
*   @param {String} uid 验证人
*   @param {String} nationCode 验证人选择的手机号对应的国际区号
*   @param {String} phoneNumber 验证人输入的手机号
*   @param {String} ip 验证人提交时的ip
*   @param {String} port 验证人提交时的端口
* @return {Object} record
* */
schema.statics.verifyPhoneNumber = async (props) => {
  const {
    uid,
    nationCode,
    phoneNumber,
    ip,
    port
  } = props;
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const VerificationRecordModel = mongoose.model('verificationRecords');
  const SettingModel = mongoose.model('settings');
  const up = await UsersPersonalModel.findOnly({uid});
  const now = Date.now();
  const time = now - 60 * 60 * 1000;
  const records = await VerificationRecordModel.find({
    uid,
    originPhoneNumber: up.mobile,
    originNationCode: up.nationCode,
    passed: false,
    toc: {$gte: time}
  }).sort({toc: -1});
  if(records.length >= 3) {
    const t = Math.floor((60 * 60 * 1000 - Date.now() + records[0].toc.getTime()) / 1000);
    const m = Math.floor(t / 60);
    const s = Math.floor((t - m * 60))
    throwErr(403, `验证次数超过限制，请在${m}分${s}秒后重试`);
  }
  const passed = nationCode === up.nationCode && phoneNumber === up.mobile;
  const record = VerificationRecordModel({
    _id: await SettingModel.getNewId(),
    ip,
    port,
    uid,
    originPhoneNumber: up.mobile,
    originNationCode: up.nationCode,
    nationCode,
    phoneNumber,
    passed
  });
  await record.save();
  if(!passed) {
    throwErr(400, `手机号验证失败`);
  } else {
    return record;
  }
};
/*
* 判断记录是否有效
* */
schema.statics.verifyRecord = async (uid, recordId) => {
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const VerificationRecordModel = mongoose.model('verificationRecords');
  const up = await UsersPersonalModel.findOne({uid});
  const {
    mobile: originPhoneNumber,
    nationCode: originNationCode
  } = up;
  const record = await VerificationRecordModel.findOne({
    uid,
    _id: recordId,
    originPhoneNumber,
    originNationCode
  });
  if(!record || Date.now() - record.toc.getTime() > 60 * 60 * 1000) {
    throwErr(400, `手机号验证失败或过期，请重试`);
  }
}

module.exports = mongoose.model('verificationRecords', schema);