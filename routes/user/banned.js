const Router = require('koa-router');
const bannedRouter = new Router();
bannedRouter
  .put('/', async (ctx, next) => {
    const { db, params, body } = ctx;
    const { uid } = params;
    const { reason = '' } = body;
    const targetUser = await db.UserModel.findOnly({ uid });
    if (!targetUser.certs.includes('banned')) {
      ctx.throw(400, '该用户未被封禁');
    }
    await targetUser.updateOne({ $pull: { certs: 'banned' } });
    await db.ManageBehaviorModel.insertLog({
      uid: ctx.state.uid,
      toUid: targetUser.uid,
      operationId: ctx.data.operationId,
      toc: new Date(),
      ip: ctx.address,
      port: ctx.port,
      desc: reason,
    });
    await next();
  })
  .del('/', async (ctx, next) => {
    const { data, params, query, db } = ctx;
    const { user } = data;
    const { reason = '' } = query;
    const { uid } = params;
    if (user.uid === uid) {
      ctx.throw(400, '为什么要封禁自己？');
    }
    const targetUser = await db.UserModel.findOnly({ uid });
    const rolesId = data.userRoles.map((r) => r._id);
    if (
      targetUser.certs.includes('dev') ||
      targetUser.certs.includes('scholar') ||
      targetUser.certs.includes('editor') ||
      targetUser.certs.includes('moderator') ||
      targetUser.xsf > 0
    ) {
      if (!rolesId.includes('editor')) {
        ctx.throw(403, '权限不足');
      }
    }
    if (targetUser.certs.includes('banned')) {
      ctx.throw(400, '该用户已被封禁');
    }
    await targetUser.updateOne({ $addToSet: { certs: 'banned' } });
    await db.ManageBehaviorModel.insertLog({
      uid,
      toUid: targetUser.uid,
      operationId: ctx.data.operationId,
      toc: new Date(),
      ip: ctx.address,
      port: ctx.port,
      desc: reason,
    });
    await next();
  });
module.exports = bannedRouter;
