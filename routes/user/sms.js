const Router = require('koa-router');
const smsRouter = new Router();

smsRouter
  .get('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    data = {uid: uid}
    ctx.data = ctx.nkcModules.render('./pages/sms.pug', {data});
    await next();
  })
  .post('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    const messageObj = ctx.request.body;
    ctx.data = `给${uid}发送信息：${JSON.stringify(messageObj)}`;
    await next();
  });

module.exports = smsRouter;