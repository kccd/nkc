const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const operationTypeSchema = new Schema({
	_id: Number,
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	tlm: {
		type: Date,
		index: 1
	},
	displayName: {
		type: String,
		required: true,
		unique: true
	},
	type: {
		type: String,
		default: 'common',
		index: 1
	},
	description: {
		type: String,
		default: ''
	}
}, {
	collection: 'operationTypes'
});


operationTypeSchema.virtual('operationCount')
	.get(function() {
		return this._operationCount;
	})
	.set(function(operationCount) {
		this._operationCount = operationCount;
	});

operationTypeSchema.virtual('operations')
	.get(function() {
		return this._operations;
	})
	.set(function(operations) {
		this._operations = operations;
	});

operationTypeSchema.pre('save', function(next) {
	if(!this.tlm) {
		this.tlm = this.toc;
	}
	next();
});

operationTypeSchema.methods.extendOperationCount = async function() {
	const OperationModel = mongoose.model('operations');
	const count = await OperationModel.countDocuments({typeId: this._id});
	return this.operationCount = count;
};

operationTypeSchema.methods.extendOperations = async function() {
	const OperationModel = mongoose.model('operations');
	const operations = await OperationModel.find({typeId: this._id}).sort({toc: 1});
	return this.operations = operations;
};

const OperationTypeModel = mongoose.model('operationTypes', operationTypeSchema);
module.exports = OperationTypeModel;