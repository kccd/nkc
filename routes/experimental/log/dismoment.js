const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const router = new Router();
router
  .get('/', OnlyOperation(Operations.managementMoment), async (ctx, next) => {
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
  }) // 修改屏蔽原因
  .put(
    '/reason',
    OnlyOperation(Operations.managementMoment),
    async (ctx, next) => {
      const { body, db, tools } = ctx;
      const { reason, id } = body;
      const { contentLength } = tools.checkString;
      if (!reason) {
        ctx.throw(400, '屏蔽原因不能为空');
      }
      if (contentLength(reason) > 500) {
        ctx.throw(400, '原因字数不能超过500');
      }
      const log = await db.DisMomentLogModel.findOne({
        _id: id,
      });
      if (!log) {
        ctx.throw(400, `未找到ID为${id}的屏蔽记录`);
      }
      await log.updateOne({
        $set: {
          reason,
        },
      });
      // 如果有消息
      if (log.noticeUser) {
        // 找出与 log.toc 差值最小的一条消息
        const [closestMessage] = await db.MessageModel.aggregate([
          {
            $match: {
              ty: 'STU',
              'c.momentId': log.momentId,
            },
          },
          {
            $addFields: {
              timeDiff: {
                $abs: { $subtract: ['$tc', log.toc] },
              },
            },
          },
          { $sort: { timeDiff: 1 } }, // 差值最小的优先
          { $limit: 1 },
        ]);

        if (closestMessage) {
          await db.MessageModel.updateOne(
            { _id: closestMessage._id },
            { $set: { 'c.reason': reason } },
          );
        }
      }
      await next();
    },
  );
module.exports = router;
