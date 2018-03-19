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
	const {mobileCodeTime} = require('../settings/sendMessage');
	const smsCode = await SmsCodeModel.findOne({nationCode, mobile, code, type, used: false});
	console.log(smsCode)
	if(smsCode && (smsCode.toc > (Date.now() - mobileCodeTime))) {
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
	const {sendMobileCodeCount, sendMobileCodeCountSameIp} = require('../settings/sendMessage');
	const SmsCodeModel = mongoose.model('smsCodes');
	let smsCodes = await SmsCodeModel.find({nationCode, mobile, type, toc: {$gte: Date.now() - 24*60*60*1000}});
	if(smsCodes.length >= sendMobileCodeCount) {
		const err = new Error('同一手机号码24小时内发送短信验证码不能超过5条。');
		err.status = 400;
		throw err;
	}
	smsCodes = await SmsCodeModel.find({type, ip, toc: {$gte: Date.now() - 24*60*60*1000}});
	if(smsCodes.length >= sendMobileCodeCountSameIp) {
		const err = new Error('同一IP24小时内发送短信验证码不能超过10条。');
		err.status = 400;
		throw err;
	}
};


module.exports = mongoose.model('smsCodes', smsCodeSchema, 'smsCodes');