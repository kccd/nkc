const Router = require('koa-router');
const scoreRouter = new Router();
scoreRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'experimental/settings/score.pug';
		const {data, db} = ctx;
		data.scoreSettings = await db.SettingModel.findOnly({type: 'score'});
		data.operations = await db.OperationModel.find().sort({toc: 1});
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