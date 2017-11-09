const Router = require('koa-router');
const operationRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
operationRouter
  // 收藏帖子
  .post('/addColl', async (ctx, next) => {
    const {tid} = ctx.params;
    const {user} = ctx.data;
    const {db} = ctx;
    let collection = await db.CollectionModel.findOne({tid: tid, uid: user.uid});
    if(collection) ctx.throw(404, '该贴子已经存在于您的收藏中，没有必要重复收藏');
    let newCollection = new db.CollectionModel({
      cid: await db.SettingModel.operateSystemID('collections', 1),
      tid: tid,
      uid: user.uid
    });
    try{
      await newCollection.save();
    } catch (err) {
      await db.SettingModel.operateSystemID('collections', -1);
      ctx.throw(404, `收藏失败: ${err}`);
    }
    await next();
  })
  // 首页置顶
  .post('/adSwitch', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    let setting = await db.SettingMode.findOneAndUpdate({uid: 'system'}, {$addToSet: {ads: tid}});
    if(setting.ads.indexOf(tid) !== -1) ctx.throw(404, '该贴子已经在首页置顶了，不需要重复操作');
    await next();
  })
  // 取消首页置顶
  .del('/adSwitch', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    await next();
  })
  .patch('/digest', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    let thread = await db.ThreadModel.findOnly({tid});
    if(thread.digest) ctx.throw(404, '该贴子已经被设置成精华了，不需要重复设置');
    await db.ThreadModel.replaceOne({tid}, {$set: {digest: true}});
    await dbFn.setNumberOfDigestThread(thread.fid, 1);
    await next();
  })
  .del('/digest', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    let thread = await db.ThreadModel.findOnly({tid});
    if(!thread.digest) ctx.throw(404, '该贴子已经被撤销精华了，不需要重复撤销');
    await db.ThreadModel.replaceOne({tid}, {$set: {digest: false}});
    await dbFn.setNumberOfDigestThread(thread.fid, -1);
    await next();
  })
  .post('/topped', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db} = ctx;
    let thread = await db.ThreadModel.findOnly({tid});
    if(thread.topped) ctx.throw(404, '该帖子已经被置顶了，不需要重复操作');
    await db.ThreadModel.replaceOne({tid}, {$set: {topped: true}});
    await next();
  })
  .del('/topped', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db} = ctx;
    let thread = await db.ThreadModel.findOnly({tid});
    if(!thread.topped) ctx.throw(404, '该帖子已经被取消置顶了，不需要重复操作');
    await db.ThreadModel.replaceOne({tid}, {$set: {topped: false}});
    await next();
  })
  .post('/moveThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `移动帖子到   tid：${tid}`;
    await next();
  })
  .post('/recycleThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `移动帖子到回收站   tid：${tid}`;
    await next();
  })
  .post('/moveToPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `移动帖子到个人版   tid：${tid}`;
    await next();
  })
  .post('/switchVInPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `在专栏显示隐藏   tid：${tid}`;
    await next();
  })
  .post('/switchDInPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `在专栏加精   tid：${tid}`;
    await next();
  })
  .post('/switchTInPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `在专栏顶置   tid：${tid}`;
    await next();
  });
module.exports = operationRouter;