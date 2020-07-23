const Router = require('koa-router');
const sysInfoRouter  = new Router();
sysInfoRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = 'experimental/systemInfo/systemInfo.pug';
    data.systemInfo = await db.MessageModel.find({ty: "STE"}).sort({tc: -1});
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
    await db.UsersGeneralModel.updateMany({'messageSettings.chat.systemInfo': false}, {$set: {'messageSettings.chat.systemInfo': true}});
    await redis.pubMessage(message);
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body} = ctx;
    const {_id, c} = body;
    if(!c) ctx.throw(400, "通知内容不能为空");
    const message = await db.MessageModel.findOne({
      _id,
      ty: "STE"
    });
    if(!message) ctx.throw(400, "通知不存在");
    await db.MessageModel.updateOne({_id, ty: "STE"}, {
      $set: {
        c
      }
    });
    await next();
  });
module.exports = sysInfoRouter;
