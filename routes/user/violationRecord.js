const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  const {data, db, params} = ctx;
  const {uid} = params;
  data.record = await db.UsersScoreLogModel.find({
    uid: uid,
    operationId: 'violation'
  }).sort({toc: -1});
  await next();
});
module.exports = router;
