const Router = require('koa-router');
const router = new Router();
router
  .post('/', async (ctx, next) => {
    const {data, db, params, body} = ctx;
    const {tid} = params;
    const {blocksId} = body;
    await db.HomeBlockModel.updateMany({_id: {$in: blocksId}}, {
      $addToSet: {
        fixedThreadsId: tid
      }
    });
    await next();
  })
module.exports = router;
