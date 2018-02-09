const Router = require('koa-router');
const quote = require('./quote');
const history = require('./history');
const credit = require('./credit');
const disabled = require('./disabled');
const recommend = require('./recommend');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const settings = require('../../settings');
const {perpage} = settings.paging;
const postRouter = new Router();

postRouter
  .get('/:pid', async (ctx, next) => {
    const {data, db} = ctx;
    const {pid} = ctx.params;
    const post = await db.PostModel.findOnly({pid});
    if(!await post.ensurePermission(ctx)) ctx.throw(401, '权限不足');
    await post.extendUser();
    await post.extendResources();
    data.post = post;
    ctx.template = 'interface_page.pug';
    await next();
  })
  .patch('/:pid', async (ctx, next) => {
    const {t, c} = ctx.body.post;
    if(c.lenght < 6) ctx.throw(400, '内容太短，至少6个字节');
    const {pid} = ctx.params;
    const {data, db} = ctx;
    const {user} = data;
    if(!c) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    if(targetThread.oc === pid && !t) ctx.throw(400, '标题不能为空!');
    const targetUser = await targetPost.extendUser();
    if(user.uid !== targetPost.uid && !await targetThread.ensurePermissionOfModerators(ctx))
      ctx.throw(401, '您没有权限修改别人的回复');
    const objOfPost = Object.assign(targetPost, {}).toObject();
    objOfPost._id = undefined;
    const histories = new db.HistoriesModel(objOfPost);
    await histories.save();
    // const quote = await dbFn.getQuote(c);
    // let rpid = '';
    // if(quote && quote[2]) {
    //   rpid = quote[2];
    //   const username = quote[1];
    //   if(rpid !== targetPost.pid) {
    //     const quoteUser = await db.UserModel.findOne({username: username});
    //     const newReplies = new db.ReplyModel({
    //       fromPid: pid,
    //       toPid: rpid,
    //       toUid: quoteUser.uid
    //     });
    //     await newReplies.save();
    //   }
    // }
    targetPost.uidlm = user.uid;
    targetPost.iplm = ctx.address;
    targetPost.t = t;
    targetPost.c = c;
    targetPost.tlm = Date.now();
    // targetPost.rpid = rpid;
    const q = {
      tid: targetThread.tid
    };
	  await targetPost.save();
	  if(!await targetThread.ensurePermissionOfModerators(ctx)) q.disabled = false;
    let {page} = await targetThread.getStep({pid, disabled: q.disabled});
    let postId = `#${pid}`;
    page = `?page=${page}`;
    data.redirect = `/t/${targetThread.tid}?&pid=${targetPost.pid}`;
    data.targetUser = targetUser;
    await targetUser.updateUserMessage();
    await next();
  })
  .use('/:pid/history', history.routes(), history.allowedMethods())
  .use('/:pid/recommend', recommend.routes(), recommend.allowedMethods())
  .use('/:pid/credit', credit.routes(), credit.allowedMethods())
  .use('/:pid/disabled', disabled.routes(), disabled.allowedMethods())
  .use('/:pid/quote', quote.routes(), quote.allowedMethods());
module.exports = postRouter;