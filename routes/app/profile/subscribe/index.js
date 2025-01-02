const { OnlyUnbannedUser } = require('../../../../middlewares/permission');

const router = require('koa-router')();
router
  .get('/user', OnlyUnbannedUser(), async (ctx, next) => {
    await next();
  })
  .get('/forum', OnlyUnbannedUser(), async (ctx, next) => {
    await next();
  })
  .get('/column', OnlyUnbannedUser(), async (ctx, next) => {
    await next();
  })
  .get('/thread', OnlyUnbannedUser(), async (ctx, next) => {
    await next();
  })
  .get('/fan', OnlyUnbannedUser(), async (ctx, next) => {
    await next();
  })
  .get('/follower', OnlyUnbannedUser(), async (ctx, next) => {
    await next();
  })
  .get('/collection', OnlyUnbannedUser(), async (ctx, next) => {
    await next();
  });
module.exports = router;
