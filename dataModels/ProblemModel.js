const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const problemSchema = new Schema({
	_id: Number,
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	uid: {
		type: String,
		index: 1
	},
	email: {
		type: String,
		index: 1
	},
	t: {
		type: String,
		required: true,
		maxlength: [25, '标题不能超过25个字'],
	},
	c: {
		type: String,
		maxlength: [2048, '内容不能超过2048个字'],
		required: true
	},
	ip: {
		type: String,
		required: true,
		index: 1
	},
	reason: {
		type: String,
		default: '',
		maxlength: [2048, '字数不能超过2048']
	},
	solution: {
		type: String,
		default: '',
		maxlength: [2048, '字数不能超过2048']
	},
	repairUid: {
		type: String,
		default: '',
		index: 1
	},
	QQ: {
		type: Number,
		maxlength: [15, 'QQ位数不能超过15位']
	}
}, {
	collection: 'problems'
});

problemSchema.statics.ensureSubmitPermission = async function(option) {
	const {ip} = option;
	const {problemCountInOneDay} = require('../settings/problem');
	const {today} = require('../nkcModules/apiFunction');
	const ProblemModel = mongoose.model('problems');
	const count = await ProblemModel.count({ip, toc: {$gt: today()}});
	if(count >= problemCountInOneDay) {
		const error = new Error(`同一IP每天只能报告${problemCountInOneDay}次问题`);
		error.status = 403;
		throw error;
	}
};

const ProblemModel = mongoose.model('problems', problemSchema);
module.exports = ProblemModel;
