const router = require('koa-router')();
const articlesRouter = require('./articles');

router
  .use('/:_id', async (ctx, next) => {
    const { db, params, data } = ctx;
    const { _id } = params;
    data.column = await db.ColumnModel.findById(_id);
    await next();
  })
  .use(
    '/:_id/articles',
    articlesRouter.routes(),
    articlesRouter.allowedMethods(),
  );
module.exports = router;
