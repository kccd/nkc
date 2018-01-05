const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const commentSchema = new Schema({
	_id: Number,
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	tlm: {
		type: Date,
	},
	applicationId: {
		type: String,
		required: true,
		index: 1
	},
	from: {
		// userCensor, projectCensor, admin, commonUser, self
		type: String,
		required: true,
		index: 1
	},
	l: {
		type: String,
		required: true,
		index: 1
	},
	support: {
		type: Boolean,
		default: null,
		index: 1
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	c: {
		type: String,
		required: true,
		index: 1
	}
},{
	collection: 'comments'
});
const CommentModel = mongoose.model('comments', commentSchema);
module.exports = CommentModel;