const Router = require('koa-router');
const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		ctx.template = "experimental/shop/auth.pug"
		await next();
	})
	.post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {authLevel} = body;
    await db.ShopSettingsModel.update({type:"homeSetting"},{$set:{authLevel: authLevel}});
		await next();
	})
module.exports = authRouter;