const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  const {nkcModules, data, db, params, query} = ctx;
  const {user} = data;
  const {uid} = params;
  const {page = 0} = query;
  const targetUser = await db.UserModel.findOnly({uid});
  data.record = await db.UsersScoreLogModel.find({
    uid: uid,
    operationId: 'violation'
  });
  await next();
});
module.exports = router;
