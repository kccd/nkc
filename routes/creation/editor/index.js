const { OnlyUser } = require('../../../middlewares/permission');

const router = require('koa-router')();
router
  .get('/column', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/community', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/zone', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/zone/moment', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/zone/article', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/book', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/draft', OnlyUser(), async (ctx, next) => {
    await next();
  });
module.exports = router;
