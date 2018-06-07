const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const manageBehaviorSchema = new Schema({
	operationId: {
		type: String,
		// required: true,
		index: 1,
		// enum: ['bindMobile', 'bindEmail', 'changeMobile', 'changeEmail', 'changeUsername', 'changePassword']
	},
	uid: {
		type: String,
		// required: true,
		index: 1
	},
	ip: {
		type: String,
		// required: true,
		index: 1
	},
	port: {
		type: String,
		// required: true
	},
	para: {
		type: Schema.Types.Mixed,
	},
	tlm: {
		type: Date,
		index: 1
	}
}, {
	collection: 'manageBehaviors'
});

manageBehaviorSchema.pre('save', function(next) {
	if(!this.tlm) {
		this.tlm = this.toc;
	}
	next();
});

const ManageBehaviorModel = mongoose.model('manageBehaviors', manageBehaviorSchema);
module.exports = ManageBehaviorModel;
