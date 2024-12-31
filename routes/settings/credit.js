const router = require('koa-router')();
const { OnlyUnbannedUser } = require('../../middlewares/permission');
router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { db, data } = ctx;
  data.xsfSettings = await db.SettingModel.getSettings('xsf');
  data.creditScore = await db.SettingModel.getScoreByOperationType(
    'creditScore',
  );
  data.creditSettings = await db.SettingModel.getCreditSettings();
  await next();
});
module.exports = router;
