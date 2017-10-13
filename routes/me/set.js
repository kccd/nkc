const Router = require('koa-router');
const setRouter = new Router();
setRouter
  .get('/', async (ctx, next) => {
    ctx.body = '修改信息页面';
    next();
  })
  .put('/username', async (ctx, next) => {
    ctx.body = '修改用户名';
    next();
  })
  .put('/password', async (ctx, next) => {
    ctx.body = '修改密码';
    next();
  })
  .put('/mobile', async (ctx, next) => {
    ctx.body = '修改电话号码';
    next();
  })
  .put('/personalsetting', async (ctx, next) => {
    ctx.body = '修改帖子签名color等';
    next();
  });

module.exports = setRouter;