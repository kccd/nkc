const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const typeSchema = new Schema({
	_id: String,
	description: {
		type: 'String',
		default: ''
	},
  num: {
		type: Number,
		required: true
	},
	count: {
		type: Number,
		default: 0,
	}
},{
	collection: 'kcbsTypes'
});

const kcbsTypeModel = mongoose.model('kcbsTypes', typeSchema);
module.exports = kcbsTypeModel;