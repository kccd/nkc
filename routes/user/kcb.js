const Router = require('koa-router');
const kcbRouter = new Router();
kcbRouter.get('/', async (ctx, next) => {
  const {nkcModules, data, db, params, query} = ctx;
  const {user} = data;
  const {uid} = params;
  const {page = 0} = query;
  const targetUser = await db.UserModel.findOnly({uid});
  if(targetUser.uid !== user.uid) ctx.throw(403, '权限不足');
  const q = {
    $or: [
      {
        from: targetUser.uid
      },
      {
        to: targetUser.uid
      }
    ]
  };
  const count = await db.KcbsRecordModel.count(q);
  const paging = nkcModules.apiFunction.paging(page, count);
  data.paging = paging;
  const kcbsRecords = await db.KcbsRecordModel.find(q, {ip: 0, port: 0}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  data.kcbsRecords = await db.KcbsRecordModel.extendKcbsRecords(kcbsRecords);
  ctx.template = 'user/kcb.pug';
  await next();
});
module.exports = kcbRouter;
