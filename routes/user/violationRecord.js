const router = require('koa-router')();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router.get(
  '/',
  OnlyOperation(Operations.violationRecord),
  async (ctx, next) => {
    const { data, db, params } = ctx;
    const { uid } = params;
    data.record = await db.UserModel.getUserBadRecords(uid);
    data.blacklistCount = await db.BlacklistModel.getBlacklistCount(uid);
    await next();
  },
);

module.exports = router;
