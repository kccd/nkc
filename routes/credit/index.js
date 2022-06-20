const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const { db, query, data, state } = ctx;
    data.xsfSettings = await db.SettingModel.getSettings("xsf");
    data.creditScore = await db.SettingModel.getScoreByOperationType('creditScore');
    data.creditSettings = await db.SettingModel.getCreditSettings();
    data.userKcb = await db.UserModel.getUserScore(state.uid, data.creditScore.type);
    await next()
  });
module.exports = router;
