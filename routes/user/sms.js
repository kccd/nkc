const Router = require('koa-router');
const smsRouter = new Router();

smsRouter
  .get('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    data = {uid: uid}
    ctx.body = ctx.nkcModules.render('./pages/sms.pug', {data});
    next();
  })
  .post('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    const messageObj = ctx.request.body;
    ctx.body = `给${uid}发送信息：${JSON.stringify(messageObj)}`;
    next();
  })

module.exports = smsRouter;