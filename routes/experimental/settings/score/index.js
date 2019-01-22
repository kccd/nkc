const Router = require('koa-router');
const scoreRouter = new Router();
scoreRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.typesOfScoreChange = await db.TypesOfScoreChangeModel.find();
		ctx.template = 'experimental/settings/score.pug';
		await next();
		/*ctx.template = 'experimental/settings/score.pug';
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
		await next();*/
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const scoreSettings = await db.SettingModel.findOnly({_id: 'score'});
		if(body.operation === 'modifyFormula') {
			const {formula} = body;
			await scoreSettings.update({'c.formula': formula});
		} else {
			const {_id, kcb, xsf} = body;
			const operation = await db.OperationModel.findOnly({_id});
			if(kcb.status && kcb.count <= 0 && kcb.count !== -1 && kcb.targetCount <= 0 && kcb.targetCount !== -1) ctx.throw(400, '科创币每天有效次数设置错误');
			if(xsf.status && xsf.count <= 0 && xsf.count !== -1 && xsf.targetCount <= 0 && xsf.targetCount !== -1) ctx.throw(400, '学术分每天有效次数设置错误');
			await operation.update({kcb, xsf});
			if(kcb.status || xsf.status) {
				await scoreSettings.update({$addToSet: {'c.operationsId': operation._id}});
			} else {
				await scoreSettings.update({$pull: {'c.operationsId': operation._id}});
			}
		}
		await next();
	});
module.exports = scoreRouter;