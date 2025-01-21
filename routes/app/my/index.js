const { OnlyUnbannedUser } = require('../../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { db, data } = ctx;
  data.userColumn = await data.user.extendUserColumn();
  data.userCertsName = await data.user.getCertsNameString();
  data.userScores = await db.UserModel.getUserScoresInfo(data.user.uid);
  ctx.template = 'app/my/my.pug';
  await next();
});
module.exports = router;
