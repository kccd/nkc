const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let emailRegisterSchema = new Schema({
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  ecode: {
    type: String,
    required: true,
    index: 1
  },
  email: {
    type: String,
    required: true,
    index: 1
  },
  username: {
    type: String,
    index: 1,
    required: true
  },
  password:{
    salt: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    }
  },
  isA: {
    type: Boolean,
    default: false
  },
  hashType: {
    type: String,
    required: true
  },
  regCode: {
    type: String,
    required: true
  },
  regIP: {
    type: String,
    default: '0.0.0.0'
  },
  regPort: {
    type: String,
    default: '0'
  },
  used: {
    type: Boolean,
    default: false
  }
});

emailRegisterSchema.statics.ensureSendPermission = async (email) => {
	const EmailRegisterModel = mongoose.model('emailRegister');
	const {sendEmailCount} = require('../settings/sendMessage');
	const emails = await EmailRegisterModel.find({email, toc: {$gt: (Date.now() - 24*60*60*1000)}});
	if(emails.length >= sendEmailCount) {
		const err = new Error(`24小时内发送给同一邮箱的邮件不能超过${sendEmailCount}封。`);
		err.status = 400;
		throw err;
	}
};


module.exports = mongoose.model('emailRegister', emailRegisterSchema, 'emailRegister');