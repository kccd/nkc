const router = require('koa-router')();

router
  .get('/', async (ctx, next) => {
    console.log('subscribe index');
    await next();
  })

module.exports = router;
