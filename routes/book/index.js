const router = require('koa-router')();
router
  .use('/bid', async (ctx, next) => {
    const {params, data} = ctx;
    const {bid} = params;
    data.book = await db.BookModel.findOnly({_id: bid})
    await next();
  })
  .get('/bid', async (ctx, next) => {
    const {data} = ctx;
    const {book} = data;
    ctx.remoteTemplate = `book/book.pug`;
    await next();
  });
module.exports = router;