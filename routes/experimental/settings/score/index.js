const Router = require('koa-router');
const scoreRouter = new Router();
scoreRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'experimental/settings/score.pug';
		const {data, db, query} = ctx;
		const {type} = query;
		data.type = type;
		data.scoreSettings = await db.SettingModel.findOnly({type: 'score'});
		data.scoreOperations = [];
		for(const _id of data.scoreSettings.operationsId) {
			const operation = await db.OperationModel.findOne({_id});
			if(operation) {
				data.scoreOperations.push(operation);
			}
		}
		data.operations = await db.OperationModel.find({_id: {$nin: data.scoreSettings.operationsId}}).sort({toc: 1});
		if(type) {
			data.operation = await db.OperationModel.findOnly({_id: type});
		} else {
			data.operation = data.scoreOperations[0] || data.operations[0];
			data.type = data.operation._id;
		}
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {operations} = body;
		const selectedOperationsId = [];
		await Promise.all(operations.map(async o => {
			const {_id, selected, score, targetScore} = o;
			const operation = await db.OperationModel.findOnly({_id});
			await operation.update({score, targetScore});
			if(selected) selectedOperationsId.push(_id);
		}));
		const scoreSettings = await db.SettingModel.findOnly({type: 'score'});
		await scoreSettings.update({operationsId: selectedOperationsId});
		await next();
	});
module.exports = scoreRouter;