const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const emailCodeSchema = new Schema({
  toc: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    match: /.*@.*/,
    required: true,
    index: 1
  },
  token: {
    type: String,
    required: true,
    index: 1
  },
  used: {
    type: Boolean,
    default: false
  },
  uid: {
    type: String,
    required: true
  },
	type: {
		type: String,
		default: '',
		index: 1
	}
});

emailCodeSchema.statics.ensureSendPermission = async (obj) => {
	const {email, type} = obj;
	const EmailCodeModel = mongoose.model('emailCodes');
	const {sendEmailCount} = require('../settings/sendMessage');
	const emailCodes = await EmailCodeModel.find({email, type, toc: {$gt: (Date.now() - 24*60*60*1000)}});
	if(emailCodes.length >= sendEmailCount) {
		const err = new Error('24小时内发送给同一邮箱的邮件不能超过5封。');
		err.status = 400;
		throw err;
	}
};

emailCodeSchema.statics.ensureEmailCode = async (obj) => {
	const EmailCodeModel = mongoose.model('emailCodes');
	const {email, type, token} = obj;
	const {emailCodeTime} = require('../settings/sendMessage');
	const emailCode = await EmailCodeModel.findOne({email, token, type, toc: {$gt: (Date.now() - emailCodeTime)}, used: false});
	if(!emailCode) {
		const err = new Error('邮件已失效，请重新发送邮件。');
		err.status = 400;
		throw err;
	} else {
		return emailCode;
	}
};

module.exports = mongoose.model('emailCodes', emailCodeSchema, 'emailCodes');