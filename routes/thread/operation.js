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
  .patch('/adSwitch', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db} = ctx;
    const {user} = ctx.data;
    let setting = await db.SettingMode.findOneAndUpdate({uid: 'system'}, {$addToSet: {ads: tid}});
    if(setting.ads.indexOf(tid) !== -1) ctx.throw(404, '该贴子已经在首页置顶了，不需要重复操作');
    await next();
  })
  // 精华
  .patch('/digest', async (ctx, next) => {
    const {tid} = ctx.params;
    const {digest} = ctx.body;
    const {db, data} = ctx;
    if(digest === undefined) ctx.throw(400, '参数不正确');
    let targetThread = {}, number;
    if(digest) {
      targetThread = await db.ThreadModel.findOneAndUpdate({tid}, {$set: {digest: true}});
      number = 1;
    } else {
      targetThread = await db.ThreadModel.findOneAndUpdate({tid}, {$set: {digest: false}});
      number = -1;
    }
    if(targetThread.digest === digest) {
      if(!digest) ctx.throw(404, '该贴子在您操作前已经被撤销精华了，请刷新');
      if(digest) ctx.throw(404, '该贴子在您操作前已经被设置成精华了，请刷新');
    }
    data.targetUser = await dbFn.findUserByTid(tid);
    await dbFn.setNumberOfDigestThread(targetThread.fid, number);
    await next();
  })
  .patch('/topped', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db, data} = ctx;
    const {topped} = ctx.body;
    if(topped === undefined) ctx.throw(400, '参数不正确');
    let targetThread = {};
    if(topped) {
      targetThread = await db.ThreadModel.findOneAndUpdate({tid}, {$set: {topped: true}});
    } else {
      targetThread = await db.ThreadModel.findOneAndUpdate({tid}, {$set: {topped: false}});
    }
    if(targetThread.topped === topped) {
      if(topped) ctx.throw(404, '该帖子在您操作前已经被置顶了，请刷新');
      if(!topped) ctx.throw(404, '该帖子在您操作前已经被取消置顶了，请刷新');
    }
    data.targetUser = await dbFn.findUserByTid(tid);
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