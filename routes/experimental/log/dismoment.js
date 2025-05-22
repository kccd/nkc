const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.managementMoment),
  async (ctx, next) => {
    const { data, nkcModules, db, query } = ctx;
    const { page = 0, t, c = '' } = query;
    const q = {};
    data.t = t;
    data.c = c;
    if (t === 'username') {
      const tUser = await db.UserModel.findOne({
        usernameLowerCase: c.toLowerCase(),
      });
      if (!tUser) {
        // q.delUserId = 'null';
      } else {
        q.uid = tUser.uid;
      }
    } else if (t === 'uid') {
      q.uid = c;
    }
    const count = await db.DisMomentLogModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const logs = await db.DisMomentLogModel.find(q)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.logs = [];
    for (let log of logs) {
      log = log.toObject();
      const { operator, uid, momentId, reason } = log;
      const targetUser = await db.UserModel.findOne({ uid });
      if (!targetUser) continue;
      let operateUser;
      if (operator) {
        operateUser = await db.UserModel.findOne({ uid: operator });
      }
      log.link = `/z/m/${momentId}`;
      log.operateUser = operateUser;
      log.targetUser = targetUser;
      data.logs.push(log);
    }
    data.paging = paging;
    ctx.template = 'experimental/log/dismoment.pug';
    await next();
  },
);
module.exports = router;
