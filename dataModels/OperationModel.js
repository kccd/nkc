const mongoose = require('../settings/database');
const redisClient = require('../settings/redisClient');
const Schema = mongoose.Schema;
const operationSchema = new Schema({
	_id: String,
	toc: {
		type: Date,
		index: 1,
		default: Date.now
	},
	tlm: {
		type: Date,
		index: 1
	},
	description: {
		type: String,
		default: ''
	},
	errInfo: {
		type: String,
		default: ''
	},
	typeId: {
		type: [Number],
		index: 1,
		default: []
	}
},{
	collection: 'operations'
});


operationSchema.pre('save', function(next){
	if(!this.tlm) this.tlm = this.toc;
	next();
});
/*
* 获取redis数据库中的所有操作ID
* @return {[String]} 操作ID组成的数组
* @author pengxiguaa 2020/8/13
* */
operationSchema.statics.getOperationsIdFromRedis = async () => {
	const operationsKey = await redisClient.keysAsync(`operation:*`);
	return operationsKey.map(key => key.split(':')[1]);
};
/*
* 同步所有操作ID到redis
* @author pengxiguaa 2020/8/13
* */
operationSchema.statics.saveAllOperationsToRedis = async () => {
	const OperationModel = mongoose.model('operations');
	const redisOperationsId = await OperationModel.getOperationsIdFromRedis();
	const operations = await OperationModel.find({}, {
		_id: 1, errInfo: 1, typeId: 1
	});
	const mongoOperationsId = [];
	await Promise.all(operations.map(async operation => {
		const {_id} = operation;
		const key = `operation:${_id}`;
		await redisClient.setAsync(key, JSON.stringify(operation));
		mongoOperationsId.push(_id);
	}));
	const uselessId = redisOperationsId.filter(id => !mongoOperationsId.includes(id));
	await Promise.all(uselessId.map(async id => {
		const key = `operation:${id}`;
		await redisClient.delAsync(key);
	}));
};
operationSchema.statics.saveAllOperationsToRedisAsync = async () => {
	setImmediate(async () => {
		const OperationModel = mongoose.model('operations');
		await OperationModel.saveAllOperationsToRedis();
	});
};
/*
* 从redis中获取操作对象
* @param {String} operationId 操作ID
* @return {Object} 操作对象
* @author pengxiguaa 2020/8/13
* */
operationSchema.statics.getOperationById = async (operationId) => {
	const key = `operation:${operationId}`;
	let operation = await redisClient.getAsync(key);
	if(!operation) return null;
	return JSON.parse(operation);
};
module.exports = mongoose.model('operations', operationSchema);
