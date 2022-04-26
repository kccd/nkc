const router = require('koa-router')();
const optionsRouter = require('./option');
const iPInfoRouter = require('./ipInfo');
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .del('/:mid', async (ctx, next) => {
    //删除动态
    const {params, db, state, data, permission} = ctx;
    const {mid} = params;
    const {uid} = state;
    const moment = await db.MomentModel.findOnly({_id: mid});
    if(!moment) ctx.throw(400, '未找到动态，请刷新');
    if(moment.uid === uid && !permission('movePostsToRecycle') && !permission('movePostsToDraft'))  return ctx.throw(401, '权限不足');
    //将当前动态标记为删除
    await moment.deleteMoment();
    await next();
  })
  .use('/:mid/ipInfo', iPInfoRouter.routes(), iPInfoRouter.allowedMethods())
  .use('/:mid/options', optionsRouter.routes(), optionsRouter.allowedMethods())
  // .use('/:aid/unblock', unblockRouter.routes(), unblockRouter.allowedMethods())
  // .use('/:aid/collection', collectionRouter.routes(), collectionRouter.allowedMethods())
module.exports = router;

