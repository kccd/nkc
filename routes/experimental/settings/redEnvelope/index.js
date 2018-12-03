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
    const {random, draftFee, share} = body;
    // 随机红包
    for(const award of random.awards) {
      if(award.kcb <= 0) ctx.throw(400, '奖金科创币得数量必须大于0');
      if(award.chance < 0) ctx.throw(400, '概率不能小于0');
      if(award.float < 0) ctx.throw(400, '政府浮动不能小于0');
      if(!award.name) ctx.throw(400, '奖金名不能为空');
    }
    // 精选红吧
    if(draftFee.defaultCount < 1) ctx.throw(400, '红包默认数目不能小于1');
    if(draftFee.minCount < 1) ctx.throw(400, '红包最小数目必须大于1');
    if(draftFee.maxCount < draftFee.minCount) ctx.throw(400, '红包最大数设置错误');
    // 分享奖励
    for(const key in share) {
      if(!share.hasOwnProperty(key)) continue;
      const s = share[key];
      s.kcb = Number(s.kcb);
      s.maxKcb = Number(s.maxKcb);
      if((s.kcb + '').includes('.') || (s.kcb + '').includes('.')) ctx.throw(400, '科创币仅支持整数');
      if(s.kcb <= 0) ctx.throw(400, '分享奖励中的科创币不能小于1');
      if(s.kcb > s.maxKcb) ctx.throw(400, '分享奖励中的科创币不能大于奖励上限');
    }
    await db.SettingModel.update({type: 'redEnvelope'}, {$set: {random, draftFee, share}});
    await next();
  });
module.exports = redEnvelopeRouter;