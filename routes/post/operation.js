const Router = require('koa-router');
const operationRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const {xsflimit} = nkcModules;

operationRouter
  .post('/recommend', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const targerPost = await db.PostModel.findOnly({pid});
    const visibleFid = await ctx.getVisibleFid();
    if(!(await targerPost.ensurePermission(visibleFid))) ctx.throw(401, '权限不足');
    if(targerPost.disabled) ctx.throw(400, '无法推荐已经被禁用的回复');
    const personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$addToSet: {recPosts: pid}});
    const post = await db.PostModel.findOneAndUpdate({pid}, {$addToSet: {recUsers: user.uid}});
    if(personal.recPosts.includes(pid) && post.recUsers.includes(user.uid))
      ctx.throw(400, '您已经推介过该post了,没有必要重复推介');
    data.targetUser = await post.getUser();
    data.message = post.recUsers.length + 1;
    await next();
  })
  .del('/recommend', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$pull: {recPosts: pid}});
    const post = await db.PostModel.findOneAndUpdate({pid}, {$pull: {recUsers: user.uid}});
    if(!personal.recPosts.includes(pid) && !post.recUsers.includes(user.uid))
      ctx.throw(400, '您没有推介过该post了,没有必要取消推介');
    data.message = (post.recUsers.length > 0)?post.recUsers.length - 1: 0;
    data.targetUser = await post.getUser();
    await next();
  })
  .get('/quote', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const targetPost = await db.PostModel.findOnly({pid});
    const visibleFid = await ctx.getVisibleFid();
    if(!(await targetPost.ensurePermission(visibleFid))) ctx.throw(401, '权限不足');
    if(targetPost.disabled) ctx.throw(400, '无法引用已经被禁用的回复');
    const post = await targetPost.extend();
    data.message = xsflimit(post);
    data.targetUser = await targetPost.getUser();
    await next();
  })
  .patch('/credit', async (ctx, next) => {
    const {db, data} = ctx;
    const {pid} = ctx.params;
    const {user} = data;
    const {type, q, reason} = ctx.body;
    if(q < -10000 || q > 10000) ctx.throw(400, '数字无效，不在范围（-10000, 10000）');
    if(reason.length < 2) ctx.throw(400, '理由写得太少了，请认真对待');
    switch (type) {
      case 'xsf':
      case 'kcb':
        break;
      default: ctx.throw(400, '未知的数字类型，请检查');
    }
    const targetPost = await db.PostModel.findOnly({pid});
    const post = targetPost.extend();
    let updateObjForUser = {};
    updateObjForUser[type] = q;
    let updateObjForPost = user.toObject();
    await db.UserModel.replaceOne({uid: post.user.uid}, {$inc: updateObjForUser});
    ctx.data.targetUser = await dbFn.findUserByPid(pid);
    await next();
  })
  .get('/history', async(ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const visibleFid = await ctx.getVisibleFid();
    const targetPost = await db.PostModel.findOnly({pid});
    if(!(await targetPost.ensurePermission(visibleFid))) ctx.throw(401, '权限不足');
    if(data.userLevel < 3 && targetPost.disabled) ctx.throw(401, '权限不足');
    data.post = targetPost;
    data.histories = await db.HistoriesModel.find({pid}).sort({tlm: -1});
    data.targetUser = await targetPost.getUser();
    ctx.template = 'interface_post_history.pug';
    await next();
  })
  .patch('/disabled', async (ctx, next) => {
    const {disabled} = ctx.body;
    const {pid} = ctx.params;
    const {db, data} = ctx;
    if(disabled === undefined) ctx.throw(400, '参数不正确');
    const visibleFid = await ctx.getVisibleFid();
    const targetPost = await db.PostModel.findOnly({pid});
    if(!(await targetPost.ensurePermission(visibleFid))) ctx.throw(401, '权限不足');
    if(data.userLevel < 4) ctx.throw(401, '权限不足');
    const obj = {disabled: false};
    if(disabled) obj.disabled = true;
    await targetPost.update(obj);
    if(targetPost.disabled === disabled) {
      if(!disabled) ctx.throw(400, '操作失败！该回复未被屏蔽，请刷新');
      if(disabled) ctx.throw(400, '操作失败！该回复在您操作之前已经被屏蔽了，请刷新');
    }
    data.targetUser = await targetPost.getUser();
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    await targetThread.updateThreadMessage();
    await next();
  });
module.exports = operationRouter;