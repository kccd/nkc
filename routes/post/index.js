const Router = require('koa-router');
const operationRouter = require('./operation');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const postRouter = new Router();

postRouter
  .get('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `加载post   pid：${pid}`;
    await next();
  })
  .patch('/:pid', async (ctx, next) => {
    const {disabled} = ctx.body;
    const {pid} = ctx.params;
    const {db} = ctx;
    let targetPost = {};
    if(disabled) {
      targetPost = await db.PostModel.findOneAndUpdate({pid}, {$set: {disabled: true}});
      if(targetPost.disabled) ctx.throw(404, '该post在您操作之前已经被屏蔽了，请刷新');
    } else{
      targetPost = await db.PostModel.findOneAndUpdate({pid}, {$set: {disabled: false}});
      if(!targetPost.disabled) ctx.throw(404, '该post在你操作之前已经被解除屏蔽了，请刷新');
    }
    await dbFn.updateThread(targetPost.tid);
    ctx.data.targetUser = await dbFn.findUserByPid(pid);
    await next();
  })
  .patch('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `更新post   pid：${pid}`;
    await next();
  })
  .use('/:pid', operationRouter.routes(), operationRouter.allowedMethods());



module.exports = postRouter;