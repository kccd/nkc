const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const infoBehaviorSchema = new Schema({
	operationId: {
		type: String,
		required: true,
		index: 1,
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	ip: {
		type: String,
		required: true,
		index: 1
	},
	port: {
		type: String,
		required: true
	},

	tlm: {
		type: Date,
		index: 1
	}
}, {
	collection: 'infoBehaviors'
});

infoBehaviorSchema.pre('save', function(next) {
	if(!this.tlm) {
		this.tlm = this.toc;
	}
	next();
});

const InfoBehaviorModel = mongoose.model('infoBehaviors', infoBehaviorSchema);
module.exports = InfoBehaviorModel;
