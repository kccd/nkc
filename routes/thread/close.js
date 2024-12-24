const Router = require('koa-router');
const router = new Router();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router
  .post('/', OnlyOperation(Operations.closeThread), async (ctx, next) => {
    const { db, params } = ctx;
    const { tid } = params;
    const thread = await db.ThreadModel.findOnly({ tid });
    await thread.updateOne({ closed: true });
    await next();
  })
  .del('/', OnlyOperation(Operations.openThread), async (ctx, next) => {
    const { db, params } = ctx;
    const { tid } = params;
    const thread = await db.ThreadModel.findOnly({ tid });
    await thread.updateOne({ closed: false });
    await next();
  });
module.exports = router;
