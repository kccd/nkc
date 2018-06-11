const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const infoBehaviorSchema = new Schema({
	toc: {
		type: Date,
		index: 1,
		default: Date.now()
	},
	pid: {
		type: String,
		index: 1,
		default: ''
	},
	fid: {
		type: String,
		index: 1,
		default: ''
	},
	tid: {
		type: String,
		index: 1,
		default: ''
	},
	operationId: {
		type: String,
		required: true,
		index: 1,
	},
	uid: {
		type: String,
		default: '',
		index: 1
	},
	ip: {
		type: String,
		default: '',
		index: 1
	},
	port: {
		type: String,
		default: ''
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
