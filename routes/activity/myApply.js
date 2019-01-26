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
    for(var i in applys){
      applys[i] = applys[i].toObject();
      const acti = await db.ActivityModel.findOnly({acid: applys[i].acid});
      applys[i].activityTitle = acti.activityTitle;
      applys[i].posterId = acti.posterId;
      applys[i].enrollStartTime = acti.enrollStartTime;
      applys[i].holdStartTime = acti.holdStartTime;
      applys[i].signUser = acti.signUser;
      applys[i].activityType = acti.activityType;
    }
    data.applys = applys;
		ctx.template = 'activity/myActivityApply.pug';
		await next();
  })
module.exports = myApplyRouter;