const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usersGradeSchema = new Schema({
	_id: Number,
	displayName: {
		type: String,
		unique: true,
		required: true
	},
	description: {
		type: String,
		default: ''
	},
	color: {
		type: String,
		default: '#aaaaaa'
	},
	score: {
		type: Number,
		unique: true,
		required: true
	},
	operationsId: {
		type: [String],
		index: 1,
		default: []
	}
}, {
	collection: 'usersGrades'
});

const UsersGradeModel = mongoose.model('usersGrades', usersGradeSchema);
module.exports = UsersGradeModel;