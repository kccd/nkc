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
    if(!t && !c) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    const targetUser = await dbFn.findUserByPid(pid);
    if(data.user.uid !== targetPost && !data.ensurePermission('GET', '/e'))
      ctx.throw(401, '您没有权限修改别人的回复');
    // 修改post








    let posts = await db.PostModel.find({tid: targetThread.tid},{pid: 1}).sort({toc: 1});
    let page = '';
    let postId = `#${pid}`;
    for (let i = 0; i < posts.length; i++) {
      if(posts[i].pid === pid) {
        page = Math.ceil(i/perpage);
        if(page <= 1){
          page = `?`;
        } else {
          page = `?page=${page-1}`;
        }
      }
    }
    data.redirect = `/t/${targetThread.tid + page + postId}`;
    data.targetUser = targetUser;
    await next();
  })
  .use('/:pid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = postRouter;