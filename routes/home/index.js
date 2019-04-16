const Router = require('koa-router');
const router = new Router();
const subscriptionRouter = require('./subscription');
router
  .get("/", async (ctx, next) => {
    const {data, db, nkcModules, query} = ctx;
    const {user} = data;

    if(user) {
      // 日常登陆
      await ctx.db.KcbsRecordModel.insertSystemRecord('dailyLogin', ctx.data.user, ctx);
      const {today} = nkcModules.apiFunction;
      const time = today();
      const dailyLogin = await db.UsersScoreLogModel.findOne({
        uid: user.uid,
        type: 'score',
        operationId: 'dailyLogin',
        toc: {
          $gte: time
        }
      });
      if(!dailyLogin) {
        await db.UserModel.updateUserKcb(user.uid);
        await db.UsersScoreLogModel.insertLog({
          user,
          type: 'score',
          typeIdOfScoreChange: 'dailyLogin',
          port: ctx.port,
          ip: ctx.address,
          key: 'dailyLoginCount'
        });
        await user.updateUserMessage();
      }
    }

    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );






    await next();
  })
  .use('subscription', subscriptionRouter.routes(), subscriptionRouter.allowedMethods());
module.exports = router;