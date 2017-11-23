const Router = require('koa-router');
const operationRouter = require('./operation');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const settings = require('../../settings');
const {perpage} = settings.paging;
const postRouter = new Router();

postRouter
  .get('/:pid', async (ctx, next) => {
    const {pid} = ctx.params;
    await next();
  })
  .patch('/:pid', async (ctx, next) => {
    const {t, c} = ctx.body.post;
    const {pid} = ctx.params;
    const {data, db} = ctx;
    const {user} = data;
    if(!t && !c) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    const targetUser = await targetPost.getUser();
    if(data.user.uid !== targetPost.uid && !await targetThread.ensurePermissionOfModerators(ctx))
      ctx.throw(401, '您没有权限修改别人的回复');
    const obj = {
      uidlm: data.user.uid,
      iplm: ctx.request.socket._peername.address,
      t: t,
      c: c,
      tlm: Date.now()
    };
    targetPost.updata(obj);
    //更新post







    const indexOfPostId = await targetThread.getIndexOfPostId();
    let page = '';
    let postId = `#${pid}`;
    indexOfPostId.map(post => {
      if(post.pid !== pid) return;
      page = Math.ceil(i/perpage);
      if(page <= 1) page = `?`;
      else page = `?page=${page - 1}`;
    });
    data.redirect = `/t/${targetThread.tid + page + postId}`;
    data.targetUser = targetUser;
    await next();
  })
  .use('/:pid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = postRouter;