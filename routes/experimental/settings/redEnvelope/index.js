const Router = require('koa-router');
const redEnvelopeRouter = new Router();
redEnvelopeRouter
  .get('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    data.redEnvelopeSettings = await db.SettingModel.getSettings('redEnvelope');
    data.postRewardScore = await db.SettingModel.getScoreByOperationType('postRewardScore');
    data.digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    data.shareRewardScore = await db.SettingModel.getScoreByOperationType('shareRewardScore');
    const shareSettings = await db.SettingModel.getSettings('share');
    const shares = [];
    for(const type in shareSettings) {
      const {
        kcb,
        maxKcb,
        rewardCount,
        rewardStatus
      } = shareSettings[type];
      shares.push({
        name: await db.ShareModel.getShareNameByType(type),
        type,
        kcb,
        maxKcb,
        rewardCount,
        rewardStatus
      });
    }
    data.shares = shares;
    data.shareRegister = data.redEnvelopeSettings.share.register;
    ctx.template = 'experimental/settings/redEnvelope.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {random, draftFee, shareRegister, shares} = body;
    const {checkNumber} = nkcModules.checkData;
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
    // 精选红包
    if(draftFee.defaultCount < 1) ctx.throw(400, '红包默认数目不能小于1');
    if(draftFee.minCount < 1) ctx.throw(400, '红包最小数目必须大于1');
    if(draftFee.maxCount < draftFee.minCount) ctx.throw(400, '红包最大数设置错误');
    // 分享奖励
    const shareSettings = await db.SettingModel.getSettings('share');
    for(const s of shares) {
      const {
        type,
        kcb,
        maxKcb,
        rewardStatus,
        rewardCount
      } = s;
      checkNumber(kcb, {
        name: '分享奖励 - 单次点击奖励',
        min: 0,
      });
      checkNumber(maxKcb, {
        name: '分享奖励 - 同一分享奖励上限',
        min: 0,
      });
      checkNumber(rewardCount, {
        name: '分享注册奖励 - 每天获得注册奖励上限',
        min: 0
      });
      shareSettings[type].kcb = kcb;
      shareSettings[type].maxKcb = maxKcb;
      shareSettings[type].rewardCount = rewardCount;
      shareSettings[type].rewardStatus = rewardStatus;
    }
    // 分享注册
    checkNumber(shareRegister.kcb, {
      name: '分享注册奖励 - 单次注册奖励',
      min: 0,
    });
    checkNumber(shareRegister.maxKcb, {
      name: '分享注册奖励 - 同一分享获得注册奖励上限',
      min: 0,
    });
    checkNumber(shareRegister.count, {
      name: '分享注册奖励 - 每天获得注册奖励次数上限',
      min: 0,
    });

    const redEnvelopeShareRegister = {
      status: shareRegister.status,
      kcb: shareRegister.kcb,
      maxKcb: shareRegister.maxKcb,
      count: shareRegister.count
    };

    await db.SettingModel.updateOne({_id: 'share'}, {
      $set: {
        c: shareSettings
      }
    });
    await db.SettingModel.saveSettingsToRedis('share');

    await db.SettingModel.updateOne({
      _id: 'redEnvelope'
    }, {
      $set: {
        'c.random': random,
        'c.draftFee': draftFee,
        'c.share.register': redEnvelopeShareRegister
      }
    });
    await db.SettingModel.saveSettingsToRedis("redEnvelope");
    await next();
  });
module.exports = redEnvelopeRouter;
