const Router = require('koa-router');
const redEnvelopeRouter = new Router();
redEnvelopeRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.redEnvelopeSettings = await db.SettingModel.getSettings('redEnvelope');
    data.postRewardScore = await db.SettingModel.getScoreByOperationType('postRewardScore');
    data.digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    data.shareRewardScore = await db.SettingModel.getScoreByOperationType('shareRewardScore');
    ctx.template = 'experimental/settings/redEnvelope.pug';
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body} = ctx;
    const {random, draftFee, share} = body;
    // 随机红包
    let probability = 0;
    if(random.chance > 0 &&random.chance <= 100){}
    else {
      ctx.throw(400, "随机红包的弹出几率设置错误，范围：(0, 100]");
    }
    for(const award of random.awards) {
      if(award.kcb <= 0) ctx.throw(400, '奖金数额必须大于0');
      if(award.chance < 0) ctx.throw(400, '概率不能小于0');
      if(award.float < 0) ctx.throw(400, '政府浮动不能小于0');
      if(!award.name) ctx.throw(400, '奖金名不能为空');
      probability += award.chance;
    }
    if(probability > 100) ctx.throw(400, '总概率不能超过100%');
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
      if((s.kcb + '').includes('.') || (s.kcb + '').includes('.')) ctx.throw(400, `奖励数额仅支持整数`);
      if(s.kcb <= 0) ctx.throw(400, '分享奖励数额不能小于1');
      if(s.kcb > s.maxKcb) ctx.throw(400, '分享奖励数额不能大于奖励上限');
    }
    await db.SettingModel.update({_id: 'redEnvelope'}, {$set: {'c.random': random, 'c.draftFee': draftFee, 'c.share': share}});
    await db.SettingModel.saveSettingsToRedis("redEnvelope");
    await next();
  });
module.exports = redEnvelopeRouter;
