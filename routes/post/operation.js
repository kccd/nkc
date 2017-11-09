const Router = require('koa-router');
const operationRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const {xsflimit} = nkcModules;

operationRouter
  .post('/recommend', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    let targerPost = await db.PostModel.findOnly({pid});
    if(targerPost.disabled) ctx.throw(404, '无法推荐已经被禁用的post');
    let personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$addToSet: {recPosts: pid}});
    let post = await db.PostModel.findOneAndUpdate({pid}, {$addToSet: {recUsers: user.uid}});
    if(personal.recPosts.indexOf(pid) > -1 && post.recUsers.indexOf(user.uid) > -1) ctx.throw(404, '您已经推介过该post了,没有必要重复推介');
    await next();
  })
  .del('/recommend', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    await db.PostModel.findOnly({pid});
    let personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$pull: {recPosts: pid}});
    let post = await db.PostModel.findOneAndUpdate({pid}, {$pull: {recUsers: user.uid}});
    if(personal.recPosts.indexOf(pid) === -1 && post.recUsers.indexOf(user.uid) === -1) ctx.throw(404, '您没有推介过该post了,没有必要取消推介');
    ctx.data.message = (post.recUsers.length > 0)?post.recUsers.length - 1: 0;
    await next();
  })
  .get('/quote', async (ctx, next) => {
    const {pid} = ctx.params;
    const {user} = ctx.data;
    const {db} = ctx;
    let post = (await db.PostModel.aggregate([
      {$match: {pid}},
      {$lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: 'uid',
        as: 'user'
      }},
      {$unwind: '$user'}
    ]))[0];
    ctx.data.message = xsflimit(post);
    await next();
  })
  .patch('/credit', async (ctx, next) => {
    const {pid} = ctx.params;
    const {user} = ctx.data;
    const {type, q, reason} = ctx.body;
    const {db} = ctx;
    if(q < -10000 || q > 10000) ctx.throw(400, '数字无效，不在范围（-10000, 10000）');
    if(reason.length < 2) ctx.throw(400, '理由写得太少了，请认真对待');
    switch (type) {
      case 'xsf':
      case 'kcb':
        break;
      default: ctx.throw(400, '未知的数字类型，请检查');
    }
    let post = (await db.PostModel.aggregate([
      {$match: {pid}},
      {$lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: 'uid',
        as: 'user'
      }},
      {$unwind: '$user'}
    ]))[0];
    let updateObjForUser = {};
    updateObjForUser[type] = q;
    let updateObjForPost = user.toObject();
    await db.UserModel.replaceOne({uid: post.user.uid}, {$inc: updateObjForUser});
    await next();
  })
  .get('/history', async(ctx, next) => {
    const {pid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    ctx.data.post = await db.PostModel.findOnly({pid});
    ctx.data.histories = await db.HistoriesModel.find({pid}).sort({tlm: -1});
    ctx.template = 'interface_post_history.pug';
    await next();
  })
  .patch('/disabled', async (ctx, next) => {
    const {disabled} = ctx.body;
    const {pid} = ctx.params;
    const {db, data} = ctx;
    if(disabled === undefined) ctx.throw(400, '参数不正确');
    let targetPost = {};
    if(disabled) {
      targetPost = await db.PostModel.findOneAndUpdate({pid}, {$set: {disabled: true}});
    } else {
      targetPost = await db.PostModel.findOneAndUpdate({pid}, {$set: {disabled: false}});
    }
    if(targetPost.disabled === disabled) {
      if(!disabled) ctx.throw(404, '操作失败！该回复未被屏蔽，请刷新');
      if(disabled) ctx.throw(404, '操作失败！该回复在您操作之前已经被屏蔽了，请刷新');
    }
    data.targetUser = await dbFn.findUserByPid(pid);
    await dbFn.updateThread(targetPost.tid);
    await next();
  });
module.exports = operationRouter;