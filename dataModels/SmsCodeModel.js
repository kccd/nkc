const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
smsCodeSchema = new Schema({
  toc: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    index: 1
  },
  mobile: {
    type: String,
    required: true,
    index: 1
  },
  used: {
    type: Boolean,
    default: false
  },
	nationCode: {
  	type: String,
		default: '86',
		index: 1
	},
	ip: {
  	type: String,
		default: null,
		index: 1
	}
}, {
	collection: 'smsCodes'
});


// 验证短信验证码是否有效
smsCodeSchema.statics.ensureCode = async (obj) => {
	const {nationCode, mobile, code, type} = obj;
	const SmsCodeModel = mongoose.model('smsCodes');
	const SettingModel = mongoose.model('settings');
	const smsSettings = await SettingModel.findOnly({type: 'sms'});
	const setting = smsSettings[type];
	if(!setting) {
		const err = new Error(`未知的短信验证码类型：${type}`);
		err.status = 400;
		throw err;
	}
	const smsCode = await SmsCodeModel.findOne({nationCode, mobile, code, type, used: false});
	if(smsCode && (smsCode.toc > (Date.now() - (setting.validityPeriod*60*1000)))) {
		return smsCode;
	} else {
		const err = new Error('短信验证码无效或已过期。');
		err.status = 400;
		throw err;
	}
};

// 验证是否有权限发送短信
smsCodeSchema.statics.ensureSendPermission = async (obj) => {
	const {nationCode, mobile, type, ip} = obj;
	const SmsCodeModel = mongoose.model('smsCodes');
	const SettingModel = mongoose.model('settings');
	const smsSettings = await SettingModel.findOnly({type: 'sms'});
	const today = require('../nkcModules/apiFunction').today();
	const setting = smsSettings[type];
	if(!setting) {
		const err = new Error(`未知的短信验证码类型：${type}`);
		err.status = 400;
		throw err;
	}
	let smsCodes = await SmsCodeModel.find({nationCode, mobile, type, toc: {$gte: today}});
	if(smsCodes.length >= setting.sameMobileOneDay) {
		const err = new Error(`每天发送相同类型的验证码条数不能超过${setting.sameMobileOneDay}条。`);
		err.status = 400;
		throw err;
	}
	smsCodes = await SmsCodeModel.find({type, ip, toc: {$gte: today}});
	if(smsCodes.length >= setting.sameIpOneDay) {
		const err = new Error(`同IP每天发送相同类型的验证码条数不能超过${setting.sameIpOneDay}条。`);
		err.status = 400;
		throw err;
	}
};

module.exports = mongoose.model('smsCodes', smsCodeSchema, 'smsCodes');