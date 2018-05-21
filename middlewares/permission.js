const fn = async (ctx, next) => {
	const {db, settings, url, method, data} = ctx;
	const {getOperation} = settings.operations;
	data.operation = getOperation(url, method);
	if(!data.userOperations.includes(data.operation)) {
		const operation = await db.OperationModel.findOne({_id: data.operation});
		ctx.throw(403, `${operation?operation.errInfo:"权限不足"}(来自权限中间件)`);
	}
	await next();
};
module.exports = fn;