const Router = require("koa-router");
const router = new Router();
const threadRouter = require('./thread');
const columnRouter = require('./column');
const forumRouter = require('./forum');
const userRouter = require('./user');
const blackListRouter = require('./blackList');
router
  .use('/', async (ctx, next) => {
    const {data, db, state, params} = ctx;
    const {user, targetUser} = data;
    //验证权限
    if (user.uid !== targetUser.uid && !ctx.permission("visitAllUserProfile")) {
      ctx.throw(403, "权限不足");
    }
    //获取当前用户等级信息
    data.targetUserScores = await db.UserModel.updateUserScores(targetUser.uid);
    await next()
  })
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/user', async (ctx,next) => {
    await next();
  })
  .use('/thread', threadRouter.routes(), threadRouter.allowedMethods())
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods())
  .use('/forum', forumRouter.routes(), forumRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/blackList', blackListRouter.routes(), blackListRouter.allowedMethods())

module.exports = router;
