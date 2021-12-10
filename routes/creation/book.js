const router = require('koa-router')();
router
  .use('/:bid', async (ctx, next) => {
    const {db, data, params} = ctx;
    data.book = await db.BookModel.getBookById(params.bid);
    await next();
  })
  .get('/:bid', async (ctx, next) => {
    await next();
  })
  .get('/:bid/settings', async (ctx, next) => {
    await next();
  });
module.exports = router;