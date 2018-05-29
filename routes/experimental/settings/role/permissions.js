const Router = require('koa-router');
const permissionsRouter = new Router();
permissionsRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.operations = await db.OperationModel.find({}).sort({toc: 1});
		data.operationTypes = await db.OperationTypeModel.find().sort({toc: 1});
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {body, settings, data} = ctx;
		const {role} = data;
		if(role._id === 'dev') {
			ctx.throw(400, '运维权限不允许编辑！！！');
		}
		const {operationsId} = body;
		const newOperationsId = [];
		const defaultOperationsId = settings.operations.getOperationsId();
		for(let operationId of operationsId) {
			if(defaultOperationsId.includes(operationId) && !newOperationsId.includes(operationId)) {
				newOperationsId.push(operationId);
			}
		}
		await role.update({operationsId: newOperationsId});
		await next();
	});
module.exports = permissionsRouter;