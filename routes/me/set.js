const Router = require('koa-router');
const setRouter = new Router();
setRouter
  .get('/', async (ctx, next) => {
    ctx.body = '修改信息页面';
    next();
  })
  .post('/username', async (ctx, next) => {
    ctx.body = '修改用户名';
    next();
  })
  .post('/password', async (ctx, next) => {
    ctx.body = '修改密码';
    next();
  })
  .post('/mobile', async (ctx, next) => {
    ctx.body = '修改电话号码';
    next();
  })
  .post('/personalsetting', async (ctx, next) => {
    ctx.body = '修改帖子签名color等';
    next();
  });

module.exports = setRouter;