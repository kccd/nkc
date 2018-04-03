const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const imgCodeSchema = new Schema({
	token: {
		type: String,
		required: true
	},
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	tlm: {
		type: Date
	},
	used: {
		type: Boolean,
		default: false
	}
}, {
	collection: 'imgCodes'
});
imgCodeSchema.pre('save', function(next) {
	if(!this.tlm) {
		this.tlm = this.toc;
	}
	next();
});

imgCodeSchema.statics.ensureCode = async (_id, token) => {
	const {effectiveTime} = require('../settings/imgCode');
	const ImgCodeModel = mongoose.model('imgCodes');
	const imgCode = await ImgCodeModel.findOne({_id: mongoose.Types.ObjectId(_id)});
	if(!imgCode) {
		const error = new Error('图片验证码无效。');
		error.status = 400;
		throw error;
	}
	if(Date.now() - effectiveTime > imgCode.toc || imgCode.used) {
		const error = new Error('图片验证码已失效。');
		error.status = 400;
		throw error;
	}
	if(imgCode.token !== token) {
		const error = new Error('图片验证码错误。');
		error.status = 400;
		throw error;
	}
	return imgCode;
};

const ImgCodeModel = mongoose.model('imgCodes', imgCodeSchema);
module.exports = ImgCodeModel;