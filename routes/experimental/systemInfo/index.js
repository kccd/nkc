const Router = require('koa-router');
const sysInfoRouter  = new Router();
sysInfoRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'experimental/systemInfo/systemInfo.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, redis} = ctx;
    const {content} = body;
    if(!content) ctx.throw(400, '内容不能为空');
    const _id = await db.SettingModel.operateSystemID('messages', 1);
    const message = db.MessageModel({
      _id,
      ty: 'STE',
      c: content
    });
    await message.save();
    await redis.pubMessage(message);
    await next();
  });
module.exports = sysInfoRouter;