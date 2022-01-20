const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {db, body} = ctx;
    const {
      source,
      sid,
      content,
      quoteCid
    } = body

    

    await next();
  })
module.exports = router;