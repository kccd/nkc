const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const router = new Router();

router.get(
  '/',
  OnlyOperation(Operations.visitExperimentalLogs),
  async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const { page = 0, c = '' } = query;

    const match = {};

    data.source = 'name';
    data.sourceContent = '';
    data.targetSource = 'name';
    data.targetSourceContent = '';

    if (c) {
      let { source, sourceContent, targetSource, targetSourceContent } =
        JSON.parse(decodeURIComponent(c));

      if (sourceContent) {
        if (source === 'name') {
          const sourceUser = await db.UserModel.findOne(
            {
              usernameLowerCase: sourceContent.toLowerCase(),
            },
            {
              uid: 1,
            },
          );
          match.uid = sourceUser ? sourceUser.uid : null;
        } else {
          match.uid = sourceContent;
        }
      }

      if (targetSourceContent) {
        if (targetSource === 'name') {
          const targetSourceUser = await db.UserModel.findOne(
            {
              usernameLowerCase: targetSourceContent.toLowerCase(),
            },
            {
              uid: 1,
            },
          );
          match.toUid = targetSourceUser ? targetSourceUser.uid : null;
        } else {
          match.toUid = targetSourceContent;
        }
      }

      data.source = source;
      data.sourceContent = sourceContent;
      data.targetSource = targetSource;
      data.targetSourceContent = targetSourceContent;
    }

    const count = await db.ManageBehaviorModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const logs = await db.ManageBehaviorModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.logs = [];
    const usersId = [];
    const operationsId = [];
    for (const log of logs) {
      usersId.push(log.uid, log.toUid);
      operationsId.push(log.operationId);
    }
    const users = await db.UserModel.find(
      { uid: { $in: usersId } },
      {
        username: 1,
        uid: 1,
        avatar: 1,
      },
    );

    const usersObj = {};
    for (const u of users) {
      usersObj[u.uid] = {
        username: u.username,
        uid: u.uid,
        homeUrl: nkcModules.tools.getUrl('userHome', u.uid),
        avatarUrl: nkcModules.tools.getUrl('userAvatar', u.avatar),
      };
    }

    for (const log of logs) {
      const user = usersObj[log.uid];
      const targetUser = usersObj[log.toUid];
      data.logs.push({
        toc: log.toc,
        user,
        targetUser,
        operationName: ctx.state.lang('operations', log.operationId),
        desc: log.desc,
      });
    }

    data.paging = paging;
    ctx.template = 'experimental/log/manage.pug';
    await next();
  },
);
module.exports = router;
