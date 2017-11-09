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
    const {title, content} = ctx.body;
    const {pid} = ctx.params;
    const {data, db} = ctx;
    if(!title && !content) ctx.throw(400, '参数不正确');
    let targetPost = await db.PostModel.findOnly({pid});
    if(data.user.uid !== targetPost && data.ensurePermission('GET', '/e'))
      ctx.throw(400, '您没有权限修改别人的回复');
    console.log(data.user);

    await next();
  })
  .use('/:pid', operationRouter.routes(), operationRouter.allowedMethods());



module.exports = postRouter;