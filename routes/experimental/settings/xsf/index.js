const Router = require('koa-router');
const xsfRouter = new Router();
xsfRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.xsfSettings = await db.SettingModel.findOnly({type: 'xsf'});
    ctx.template = 'experimental/settings/xsf.pug';
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body} = ctx;
    const {addLimit, reduceLimit} = body.xsfSettings;
    if(addLimit <= 0) ctx.throw(400, '加学术分分值不能小于1');
    if(reduceLimit <= 0) ctx.throw(400, '减学术分分值不能小于1');
    await db.SettingModel.update({type: 'xsf'}, {$set: {addLimit, reduceLimit}});
    await next();
  });
module.exports = xsfRouter;