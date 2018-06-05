const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const usersScoreLogSchema = new Schema({
	uid: {
		type: String,
		default: '',
		index: 1
	},
	type: {
		type: String,
		required: true,
		index: 1
	},
	targetUid: {
		type: String,
		default: '',
		index: 1
	},
	change: {
		type: Number,
		default: 0,
		index: 1
	},
	targetChange: {
		type: Number,
		default: 0,
		index: 1
	},
	operationId: {
		type: String,
		required: true,
		index: 1
	},
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	tid: {
		type: String,
		default: '',
		index: 1
	},
	fid: {
		type: String,
		default: '',
		index: 1
	},
	pid: {
		type: String,
		default: '',
		index: 1
	}
}, {
	collection: 'usersScoreLogs'
});

const UsersScoreLogModel = mongoose.model('usersScoreLogs', usersScoreLogSchema);

module.exports = UsersScoreLogModel;
