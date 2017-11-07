const Router = require('koa-router');
const operationRouter = new Router();

operationRouter
  // 对用户可见
  .put('/forUsers', async (ctx, next) => {
    const {db} = ctx;
    const {fid} = ctx.params;
    let targetForum = await db.ForumModel.findOneAndUpdate({fid}, {$set: {visibility: true}});
    if(targetForum.visibility) ctx.throw(404, '该板块在您操作之前已经被设置成对用户可见了，请刷新');
    ctx.data.visibility = !targetForum.visibility;
    await next();
  })
  // 对用户不可见
  .del('/forUsers', async (ctx, next) => {
    const {db} = ctx;
    const {fid} = ctx.params;
    let targetForum = await db.ForumModel.findOneAndUpdate({fid}, {$set: {visibility: false}});
    if(!targetForum.visibility) ctx.throw(404, '该板块在您操作之前已经被设置成对用户不可见了，请刷新');
    ctx.data.visibility = !targetForum.visibility;
    await next();
  })
  // 无权限可见
  .del('/forUsersByCerts', async (ctx, next) => {
    const {db} = ctx;
    const {fid} = ctx.params;
    let targetForum = await db.ForumModel.findOneAndUpdate({fid}, {$set: {isVisibleForNCC: false}});
    if(!targetForum.isVisibleForNCC) ctx.throw(404, '该板块在您操作之前已经被设置成无权限可见了，请刷新');
    ctx.data.isVisibleForNCC = !targetForum.isVisibleForNCC;
    await next();
  })
  // 无权限不可见
  .put('/forUsersByCerts', async (ctx, next) => {
    const {db} = ctx;
    const {fid} = ctx.params;
    let targetForum = await db.ForumModel.findOneAndUpdate({fid}, {$set: {isVisibleForNCC: true}});
    if(targetForum.isVisibleForNCC) ctx.throw(404, '该板块在您操作之前已经被设置成无权限不可见了，请刷新');
    ctx.data.isVisibleForNCC = !targetForum.isVisibleForNCC;
    await next();
  });
module.exports = operationRouter;