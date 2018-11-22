const Router = require('koa-router');
const redEnvelopeRouter = new Router();
redEnvelopeRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.redEnvelopeSettings = await db.SettingModel.findOnly({type: 'redEnvelope'});
    ctx.template = 'experimental/settings/redEnvelope.pug';
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body} = ctx;
    const {random, draftFee} = body;
    for(const award of random.awards) {
      if(award.kcb <= 0) ctx.throw(400, '奖金科创币得数量必须大于0');
      if(award.chance < 0) ctx.throw(400, '概率不能小于0');
      if(award.float < 0) ctx.throw(400, '政府浮动不能小于0');
      if(!award.name) ctx.throw(400, '奖金名不能为空');
    }
    if(draftFee.defaultCount < 1) ctx.throw(400, '红包默认数目不能小于1');
    if(draftFee.minCount < 1) ctx.throw(400, '红包最小数目必须大于1');
    if(draftFee.maxCount < draftFee.minCount) ctx.throw(400, '红包最大数设置错误');
    await db.SettingModel.update({type: 'redEnvelope'}, {$set: {random, draftFee}});
    await next();
  });
module.exports = redEnvelopeRouter;