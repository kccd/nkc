const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  const {data, db, params} = ctx;
  const {uid} = params;
  data.record = await db.UserModel.getUserBadRecords(uid);
  data.blacklistCount = await db.BlacklistModel.getBlacklistCount(uid);
  await next();
});

module.exports = router;
