const {
  OnlyUnbannedUser,
  Public,
} = require('../../../../middlewares/permission');

const router = require('koa-router')();
router
  .get('/user', Public(), async (ctx, next) => {
    await next();
  })
  .get('/forum', Public(), async (ctx, next) => {
    await next();
  })
  .get('/column', Public(), async (ctx, next) => {
    await next();
  })
  .get('/thread', Public(), async (ctx, next) => {
    await next();
  })
  .get('/fan', Public(), async (ctx, next) => {
    await next();
  })
  .get('/follower', Public(), async (ctx, next) => {
    await next();
  })
  .get('/collection', Public(), async (ctx, next) => {
    await next();
  });
module.exports = router;
