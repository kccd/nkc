const fn = async (ctx, next) => {
  const {data, state} = ctx;
	if(!data.userOperationsId.includes(data.operationId)) {
		ctx.throw(403, `${state.operation.errInfo || "权限不足"}`);
	}
	await next();
};
module.exports = fn;
