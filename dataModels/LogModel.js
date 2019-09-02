const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const logSchema = new Schema({
  error: Object,
  method: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true
  },
  query: Schema.Types.Mixed,
  status: {
    type: Number,
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
    required: true,
	  index: 1
  },
  operationId: {
    type: String,
    required: true,
    index: 1
  },
  reqTime: {
  	type: Date,
	  index: 1
  },
  processTime: Number,
  uid: {
    type: String,
    required: true,
	  index: 1
  },
  referer: {
    type: String,
    default: ""
  },
  userAgent: {
    type: String,
    default: ""
  }
});

logSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(user) {
		this._user = user;
	});

logSchema.methods.extendUser = async function() {
	const UserModel = require('./UserModel');
	return this.user = await UserModel.findOne({uid: this.uid});
};

logSchema.methods.extendOperationName = async function(){
	const OperationModel = mongoose.model("operations");
	let operationData;
	if(this.operationId){
		const o = await OperationModel.findOne({_id: this.operationId});
		if(o){
			operationData = o;
		}
	}
	return this.operationData = operationData
};

const LogModel = mongoose.model('logs', logSchema);
module.exports = LogModel;

