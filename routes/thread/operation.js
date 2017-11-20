const Router = require('koa-router');
const operationRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const tools = require('../../tools');
const {imageMagick} = tools;
operationRouter
  // 收藏帖子
  .post('/addColl', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const thread = await db.ThreadModel.findOnly({tid});
    const visibleFid = await ctx.getVisibleFid();
    if(!thread.ensurePermission(visibleFid)) ctx.throw(401, '权限不足');
    if(thread.disabled && !data.ensurePermission('GET', '/e')) ctx.throw(401, '您没有权限收藏已被屏蔽的帖子');
    const collection = await db.CollectionModel.findOne({tid: tid, uid: user.uid});
    if(collection) ctx.throw(400, '该贴子已经存在于您的收藏中，没有必要重复收藏');
    const newCollection = new db.CollectionModel({
      cid: await db.SettingModel.operateSystemID('collections', 1),
      tid: tid,
      uid: user.uid
    });
    try{
      await newCollection.save();
    } catch (err) {
      await db.SettingModel.operateSystemID('collections', -1);
      ctx.throw(500, `收藏失败: ${err}`);
    }
    data.targetUser = await thread.getUser();
    await next();
  })
  // 首页置顶
  .patch('/ad', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const visibleFid = await ctx.getVisibleFid();
    const thread = await db.ThreadModel.findOnly({tid});
    if(!thread.ensurePermission(visibleFid)) ctx.throw(401, '权限不足');
    if(thread.disabled) ctx.throw(404, '该贴子已被屏蔽，请先解除屏蔽再执行置顶操作');
    const setting = await db.SettingModel.findOnly({uid: 'system'});
    const ads = setting.ads;
    const index = ads.findIndex((elem, i, arr) => elem === tid);
    const targetUser = await thread.getUser();
    if(index > -1) {
      ads.splice(index, 1);
      await imageMagick.removeFile(`./resources/ad_posts/${tid}.jpg`);
    } else {
      if(ads.length === 6) {
        ads.shift();
      }
      ads.push(tid);
      const oc = await db.PostModel.findOnly({pid: thread.oc});
      let resourceArr = oc.r || [];
      let resource = (await db.ResourceModel.aggregate([
        {$match:{rid: {$in: resourceArr}}},
        {$match: {ext: {$in: ['jpg', 'png', 'svg', 'jpeg']}}},
      ]))[0];
      if(resource) {
        const name = `./resources/ad_posts/${tid}.jpg`;
        const path = `./resources/upload${resource.path}`;
        await imageMagick.generateAdPost(path, name);
      } else {
        const path = `./resources/newavatar/${targetUser.uid}.jpg`;
        const name = `./resources/ad_posts/${tid}.jpg`;
        await imageMagick.generateAdPost(path, name);
      }
    }
    await setting.update({ads});
    await next();
  })
  // 精华
  .patch('/digest', async (ctx, next) => {
    const {tid} = ctx.params;
    const {digest} = ctx.body;
    const {db, data} = ctx;
    if(digest === undefined) ctx.throw(400, '参数不正确');
    const visibleFid = await ctx.getVisibleFid();
    const thread = await db.ThreadModel.findOnly({tid});
    if(!thread.ensurePermission(visibleFid)) ctx.throw(401, '权限不足');
    if(thread.disabled) ctx.throw(400, '该贴子已被屏蔽，请先解除屏蔽再执行置顶操作');
    const obj = {digest: false};
    let number = -1;
    if(digest) {
      obj.digest = true;
      number = 1;
    }
    await thread.update(obj);
    if(thread.digest === digest) {
      if(!digest) ctx.throw(400, '该贴子在您操作前已经被撤销精华了，请刷新');
      if(digest) ctx.throw(400, '该贴子在您操作前已经被设置成精华了，请刷新');
    }
    data.targetUser = await thread.getUser;
    const targetForum = await db.ForumModel.findOnly({fid: thread.fid});
    await targetForum.setCountOfDigestThread(number);
    await next();
  })
  .patch('/topped', async (ctx, next) => {
    const {tid} = ctx.params;
    const {db, data} = ctx;
    const {topped} = ctx.body;
    if(topped === undefined) ctx.throw(400, '参数不正确');
    const visibleFid = await ctx.getVisibleFid();
    const thread = await db.ThreadModel.findOnly({tid});
    if(!thread.ensurePermission(visibleFid)) ctx.throw(401, '权限不足');
    if(thread.disabled) ctx.throw(400, '该贴子已被屏蔽，请先解除屏蔽再执行置顶操作');
    const obj = {topped: false};
    if(topped) obj.topped = true;
    await thread.update(obj);
    if(thread.topped === topped) {
      if(topped) ctx.throw(400, '该帖子在您操作前已经被置顶了，请刷新');
      if(!topped) ctx.throw(400, '该帖子在您操作前已经被取消置顶了，请刷新');
    }
    data.targetUser = await thread.getUser();
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