const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.redEnvelopeSettings = await db.SettingModel.getSettings("redEnvelope");
    data.digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    await next();
  })

module.exports = router;
