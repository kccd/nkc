const Router = require('koa-router');
const productionRouter = new Router();
productionRouter
	.post('/', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {code} = body;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		const {user} = data;
		if(targetUser.uid !== user.uid) ctx.throw(403, '权限不足');
		if(user.volumeA) ctx.throw(400, '您已通过A卷考试，不需要绑定序列号。');
		const productionCode = await db.ProductionsCodeModel.findOne({_id: code});
		if(!productionCode) ctx.throw(400, '序列号无效。');
		if(productionCode.uid) ctx.throw(400, '序列号已被使用。');
		productionCode.uid = uid;
		await productionCode.save();
		await user.updateOne({volumeA: true});
		await next();
	});
module.exports = productionRouter;
