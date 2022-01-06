const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db, state} = ctx;
    ctx.remoteTemplate = 'creation/index.pug';
    await next();
  })
module.exports = router;
