const fn = async (ctx, next) => {
	const {db, nkcModules, url, method, data} = ctx;
	const {getOperation} = nkcModules.permission;
	data.operationId = getOperation(url, method);
	if(!data.userOperationsId.includes(data.operationId)) {
		const operation = await db.OperationModel.findOne({_id: data.operationId});
		ctx.throw(403, `${operation?operation.errInfo:"权限不足"}(来自权限中间件)`);
	}
	await next();
};
module.exports = fn;