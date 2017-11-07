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
  .del('/:pid', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    let targetPost = await db.PostModel.findOneAndUpdate({pid}, {$set: {disabled: true}});
    console.log(`pid: ${pid}`);
    console.log(targetPost);
    if(targetPost.disabled) ctx.throw(404, '该post在您操作之前已经被屏蔽了，请刷新');
    await dbFn.updateThread(targetPost.tid);
    await next();
  })
  .post('/:pid', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    let targetPost = await db.PostModel.findOneAndUpdate({pid}, {$set: {disabled: false}});
    if(!targetPost.disabled) ctx.throw(404, '该post在你操作之前已经被解除屏蔽了，请刷新');
    await dbFn.updateThread(targetPost.tid);
    await next();
  })
  .get('/:pid/postHistory', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `历史修改记录 页面   pid：${pid}`;
    await next();
  })
  .get('/:pid/editor', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `编辑post页面   pid：${pid}`;
    await next();
  })
  .put('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `更新post   pid：${pid}`;
    lksdjlfjdslfk();
    await next();
  })
  .use('/:pid', operationRouter.routes(), operationRouter.allowedMethods());



module.exports = postRouter;