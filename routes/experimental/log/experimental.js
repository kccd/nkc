const Router = require('koa-router');
const router = new Router();
router.get('/', async (ctx, next) => {
  const { data, db, query, nkcModules } = ctx;
  const { page = 0 } = query;
  const count = await db.ManageBehaviorModel.countDocuments({});
  const paging = nkcModules.apiFunction.paging(page, count);
  const logs = await db.ManageBehaviorModel.find({})
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

  const operations = await db.OperationModel.find(
    { _id: { $in: operationsId } },
    {
      _id: 1,
      description: 1,
    },
  );

  const operationsObj = {};
  for (const operation of operations) {
    operationsObj[operation._id] = operation;
  }

  for (const log of logs) {
    const user = usersObj[log.uid];
    const targetUser = usersObj[log.toUid];
    const operation = operationsObj[log.operationId];
    data.logs.push({
      toc: log.toc,
      user,
      targetUser,
      operationName: operation.description,
      desc: log.desc,
    });
  }
  /*data.result = await Promise.all(logs.map(async behavior => {
      if(behavior.operationId === "disabledPost" && behavior.para && behavior.para.disabled){
        behavior.manageName = "屏蔽回复"
      }else if(behavior.operationId === "disabledPost" && behavior.para && !behavior.para.disabled){
        behavior.manageName = "解除屏蔽回复"
      }else{
        behavior.manageName = "";
      }
      await behavior.extendUser();
      await behavior.extendToUser();
      await behavior.extendOperationName();
			return behavior;
    }));*/
  data.paging = paging;
  ctx.template = 'experimental/log/manage.pug';
  await next();
});
module.exports = router;
