const Router = require('koa-router');
const myApplyRouter = new Router();
myApplyRouter
	.get('/', async (ctx, next) => {
    const {data, db, params, query} = ctx;
    const {user} = data;
    if(!user){
      ctx.throw(400, "尚未登陆")
    }
    const applys = await db.ActivityApplyModel.find({"uid":user.uid, "applyStatus":"success"}).sort({toc: 1});
    await Promise.all(applys.map(async apply => {
			await apply.extendActivity();
		}));

    console.log(applys)
    data.applys = applys;
		ctx.template = 'activity/myActivityApply.pug';
		await next();
  })
module.exports = myApplyRouter;