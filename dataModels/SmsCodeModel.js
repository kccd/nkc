const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
smsCodeSchema = new Schema({
  toc: {
    type: Date,
		index: 1,
    default: Date.now
  },
  type: {
    type: String,
		index: 1,
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
	let smsSettings = await SettingModel.findOnly({_id: 'sms'});
	smsSettings = smsSettings.c;
	let setting;
	for(const template of smsSettings.templates) {
	  if(template.name === type) {
      setting = template;
      break;
    }
  }
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
	let smsSettings = await SettingModel.findOnly({_id: 'sms'});
	smsSettings = smsSettings.c;
	const today = require('../nkcModules/apiFunction').today();
	let setting;
	for(const template of smsSettings.templates) {
	  if(template.name === type) {
	    setting = template;
	    break;
    }
  }
	if(!setting) {
		const err = new Error(`未知的短信验证码类型：${type}`);
		err.status = 400;
		throw err;
	}
	let smsCodes = await SmsCodeModel.find({nationCode, mobile, type, toc: {$gte: today}}).sort({toc: -1});
	if(smsCodes.length !== 0) {
    const timeLimit = smsCodes[0].toc - (Date.now() - 2*60*1000);

    if(timeLimit > 0) {
      // const err = new Error(`发送验证码的间隔不能小于120秒，请${(timeLimit/1000).toFixed(0)}秒后再试`);
      const err = new Error(`发送验证码的间隔不能小于120秒`);
      err.status = 400;
      throw err;
    }
	}

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

/*
* 标记短信验证码为已使用
* @author pengxiguaa 2021-1-7
* */
smsCodeSchema.methods.mark = async function() {
	await this.updateOne({used: true});
};
module.exports = mongoose.model('smsCodes', smsCodeSchema, 'smsCodes');
