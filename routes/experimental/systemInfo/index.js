const Router = require('koa-router');
const sysInfoRouter  = new Router();
sysInfoRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'experimental/systemInfo/systemInfo.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body} = ctx;
    const {content} = body;
    if(!content) ctx.throw(400, '内容不能为空');
    const _id = await db.SettingModel.operateSystemID('messages', 1);
    const message = db.MessageModel({
      _id,
      ty: 'STE',
      c: content,

    });
  });
module.exports = sysInfoRouter;