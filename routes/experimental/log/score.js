const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const router = new Router();
router.get('/', OnlyOperation(Operations.visitScoreLogs), async (ctx, next) => {
  ctx.template = 'experimental/log/score.pug';
  const { nkcModules, data, db, query } = ctx;
  const { page = 0, type = 'kcb', t, c } = query;
  data.type = type;
  const q = {};
  if (type) {
    q.type = type;
  }
  if (t === 'username') {
    const tUser = await db.UserModel.findOne({
      usernameLowerCase: c.toLowerCase(),
    });
    if (tUser) {
      q.uid = tUser.uid;
    }
  } else if (t === 'uid') {
    q.uid = c;
  }
  q.type = 'score';
  data.type = 'score';
  const count = await db.UsersScoreLogModel.countDocuments(q);
  const paging = nkcModules.apiFunction.paging(page, count);
  data.paging = paging;
  const logs = await db.UsersScoreLogModel.find(q)
    .sort({ toc: -1 })
    .skip(paging.start)
    .limit(paging.perpage);
  data.logs = await Promise.all(
    logs.map(async (log) => {
      await log.extendOperation();
      await log.extendUser();
      await log.extendTargetUser();
      return log;
    }),
  );
  await next();
});
module.exports = router;
