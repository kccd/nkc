const Router = require('koa-router');
const myReleaseRouter = new Router();
myReleaseRouter
	.get('/', async (ctx, next) => {
    const {data, db, params, query} = ctx;
    const {user} = data;
    if(!user){
      ctx.throw(400, "尚未登陆")
    }
    const releases = await db.ActivityModel.find({"uid":user.uid}).sort({toc: 1});
    // await Promise.all(releases.map(async release => {
		// 	await release.extendActivity();
		// }));

    data.releases = releases;
		ctx.template = 'activity/myActivityRelease.pug';
		await next();
  })
module.exports = myReleaseRouter;