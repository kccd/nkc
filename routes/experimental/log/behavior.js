const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const operationGroups = require('../../../settings/operationGroups');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.visitBehaviorLogs),
  async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const operations = [...operationGroups.usersBehavior];
    let queryData = {};
    if (query.c) {
      try {
        queryData = JSON.parse(decodeURIComponent(query.c));
      } catch (e) {
        //
      }
    }
    const { page = 0 } = query;
    const {
      userType = '',
      userText = '',
      operation = '',
      fid = '',
      uid = '',
      tid = '',
      pid = '',
      ip = '',
    } = queryData;
    const q = {};

    // 筛选用户
    if (userText) {
      if (userType === 'username') {
        const targetUser = await db.UserModel.findOne(
          {
            usernameLowerCase: userText.toLowerCase(),
          },
          {
            uid: 1,
          },
        );
        if (targetUser) {
          q.uid = targetUser.uid;
        }
      } else {
        q.uid = userText;
      }
    }

    // 筛选操作
    if (operation && operations.includes(operation)) {
      q.operationId = operation;
    }

    // 筛选目标
    if (fid) {
      q.fid = fid;
    }
    if (tid) {
      q.tid = tid;
    }
    if (pid) {
      q.pid = pid;
    }
    if (uid) {
      q.toUid = uid;
    }

    // 筛选IP
    if (ip) {
      q.ip = ip;
    }
    const count = await db.UsersBehaviorModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const logs = await db.UsersBehaviorModel.find(q)
      .sort({ timeStamp: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const usersId = new Set();
    for (const log of logs) {
      usersId.add(log.uid);
    }
    const usersObject = await db.UserModel.getUsersObjectByUsersId([
      ...usersId,
    ]);
    data.results = [];
    for (const log of logs) {
      const { uid, fid, tid, pid, toUid, operationId, timeStamp, port, ip } =
        log;
      const user = usersObject[uid];
      data.results.push({
        user: user && {
          uid,
          username: user.username,
        },
        operationId: operationId,
        operationName: ctx.state.lang('operations', operationId),
        fid: fid,
        tid: tid,
        pid: pid,
        toUid: toUid,
        timeStamp: timeStamp,
        ip,
        port,
      });
    }
    data.c = query.c;
    data.paging = paging;
    data.operations = operations.map((operationId) => {
      return {
        operationId: operationId,
        operationName: ctx.state.lang('operations', operationId),
      };
    });
    ctx.template = 'experimental/log/behavior.pug';
    await next();
  },
);
module.exports = router;
