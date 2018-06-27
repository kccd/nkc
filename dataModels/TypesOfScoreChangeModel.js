const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const typeSchema = new Schema({
	_id: String,
	description: {
		type: 'String',
		default: ''
	},
	change: {
		type: Number,
		required: true
	},
	cycle: {// day, unlimited
		type: String,
		default: 'day'
	},
	count: {
		type: Number,
		default: 0,
	}
},{
	collection: 'typesOfScoreChange'
});

const typesOfScoreChangeModel = mongoose.model('typesOfScoreChange', typeSchema);
module.exports = typesOfScoreChangeModel;