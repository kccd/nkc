const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const smsRouter = require('./sms');
const collectionsRouter = require('./collections');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    ctx.data.users = await ctx.db.UserModel.find({}).sort({toc: -1}).limit(10);
    await next();
  })
  .get('/:uid', async (ctx, next) => {
    let {db} = ctx;
    const uid = ctx.params.uid;
    ctx.data.message = await db.UserModel.findOne({uid: uid});
    ctx.template = 'user.pug';
    await next();
  })
  .del('/:uid', async (ctx, next) => {
    let {uid} = ctx.params;
    let {db} = ctx;
    let {user} = ctx.data;
    let targetUser = await db.UserModel.findOnly({uid: uid});
    let certs = targetUser.certs;
    if(certs.indexOf('banned') > -1) ctx.throw(404, '该用户在你操作之前已经被封禁了，请刷新');
    if(
      certs.indexOf('moderator') >= 0 ||
      certs.indexOf('editor') >= 0 ||
      certs.indexOf('dev') >= 0 ||
      certs.indexOf('scholar') >= 0 ||
      targetUser.xsf > 0
    ){
      ctx.throw(404, '为什么？你为何要封禁此用户？你是怎么了？');
    }
    await db.UserModel.replaceOne({uid: targetUser.uid}, {$addToSet: {certs: 'banned'}});
    ctx.data.message = `封禁用户 uid:${targetUser.uid}, username:${targetUser.username} 成功`;
    await next();
  })
  .put('/:uid', async (ctx, next) => {
    let {uid} = ctx.params;
    let {db} = ctx;
    let {user} = ctx.data;
    let targetUser = await db.UserModel.findOnly({uid: uid});
    let certs = targetUser.certs;
    if(certs.indexOf('banned') === -1) ctx.throw(404, '该用户在你操作之前已经被解封了，请刷新');
    await db.UserModel.replaceOne({uid: targetUser.uid}, {$pull: {certs: 'banned'}});
    ctx.data.message = `解封用户 uid:${targetUser.uid}, username:${targetUser.username} 成功`;
    await next();
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
  
  /* .post('/', async (ctx, next) => {
    ctx.data = JSON.stringify(ctx.query) + JSON.stringify(ctx.request.body);
    await next()
  }) */
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/sms', smsRouter.routes(), smsRouter.allowedMethods())
  .use('/:uid/collections', collectionsRouter.routes(), collectionsRouter.allowedMethods());
module.exports = userRouter;