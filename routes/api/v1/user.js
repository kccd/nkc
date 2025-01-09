const { OnlyUnbannedUser, Public } = require('../../../middlewares/permission');

const router = require('koa-router')();

router.get('/:uid/public-info', Public(), async (ctx, next) => {
  const { uid } = ctx.params;
  const user = await ctx.db.UserModel.findOne(
    { uid },
    {
      uid: 1,
      username: 1,
      description: 1,
    },
  );
  ctx.apiData = {
    user: {
      uid: user.uid,
      name: user.username,
      desc: user.description,
    },
  };
  await next();
});
module.exports = router;
