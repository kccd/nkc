const { OnlyUser } = require('../../../middlewares/permission');

const router = require('koa-router')();
router
  .get('/', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/thread', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/post', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/draft', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/note', OnlyUser(), async (ctx, next) => {
    await next();
  });
module.exports = router;
