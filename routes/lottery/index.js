const Router = require('koa-router');
const luckRouter = new Router();
luckRouter
  .get('/', async (ctx, next) => {
    const {nkcModules, data, db} = ctx;
    const {user} = data;
    const today = nkcModules.apiFunction.today();
    const postCount = await db.PostModel.count({uid: user.uid, toc: {$gt: today}});
    if(postCount !== 1) ctx.throw(403, '权限不足');
    ctx.template = 'lottery/lottery.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const redEnvelopeSettings = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    const {random} = redEnvelopeSettings.c;
    if(random.close) ctx.throw(403, '抱歉，抽奖功能已关闭！');
    if(!user.generalSettings.lotterySettings.status) ctx.throw(403, '抱歉，您暂未获得抽奖机会，请刷新。');
    let n = 1;
    const number = Math.ceil(Math.random()*100);
    let result;
    for(const award of random.awards) {
      if(award.chance <= 0) continue;
      if(number >= n && number < (n + award.chance)) {
        result = award;
        break;
      }
      n += award.chance;
    }
    if(!result) {
      return await next();
    }
    let floatRange = Math.round(Math.random()*result.float);
    const symbol = Math.round(Math.random());
    if(symbol === 0) floatRange = floatRange*-1;
    let kcb = result.kcb + result.kcb*floatRange*0.01;
    kcb = Math.round(kcb);

    const _id = await db.SettingModel.operateSystemID('kcbsRecords', 1);
    const record = db.KcbsRecordModel({
      _id,
      from: 'bank',
      type: 'lottery',
      to: user.uid,
      description: result.name,
      ip: ctx.address,
      port: ctx.port,
      num: kcb
    });
    await record.save();

    user.kcb = await db.UserModel.updateUserKcb(user.uid);

    data.kcb = kcb;
    data.result = result;
    await user.generalSettings.update({'lotterySettings.status': false});
    await next();
  })
  .del('/', async (ctx, next) => {
    const {data} = ctx;
    const {user} = data;
    await user.generalSettings.update({'lotterySettings.status': false});
    await next();
  });
module.exports = luckRouter;