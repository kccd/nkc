const Router = require('koa-router');
const appRouter = new Router();
const meRouter = require('./me');
const userRouter = require('./user');
const threadRouter = require('./thread');
const searchRouter = require('./search');
const scoreChangeRouter = require('./scoreChange');
const latestRouter = require('./latest');
const forumRouter = require('./forum');
const checkRouter = require('./check');
const { upload, cache } = require('../../settings');
const { androidSavePath, iosSavePath } = upload;
appRouter
  .get('/', async (ctx, next) => {
    const { db, data } = ctx;
    let stableVer = await db.AppVersionModel.findOne({
      appPlatForm: "android",
      stable: true,
      canDown: true
    });
    if (stableVer) {
      let newVersion = stableVer.toObject();
      newVersion.url = '/app/' + newVersion.appPlatForm + '/' + newVersion.hash;
      data.newVersion = newVersion;
    }
    ctx.template = 'app/index.pug';
    await next();
  })
  .get('/android/:hash', async (ctx, next) => {
    const { fs, db, params } = ctx;
    const { hash } = params;
    const q = { appPlatForm: 'android' };
    q.hash = hash;
    // 获取最新的安装包
    const androidApk = await db.AppVersionModel.findOne(q);
    if (!androidApk) ctx.throw(404, 'not found');
    const { fileName } = androidApk;
    let stat;
    let url = `${androidSavePath}/${hash}/${fileName}`;
    try {
      stat = await fs.stat(url);
    } catch (e) {
      ctx.throw(401, "下载失败，请联系管理员！");
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'apk';
      ctx.filePath = url;
    };
    await next();
  })
  .get('/ios/:hash', async (ctx, next) => {
    const { fs, db, params } = ctx;
    // 获取最新的安装包
    const { hash } = params;
    const q = { appPlatForm: 'ios' };
    q.hash = hash;
    const androidApk = await db.AppVersionModel.findOne(q);
    if (!androidApk) ctx.throw(404, 'not found');
    const { fileName } = androidApk;
    let stat;
    let url = `${iosSavePath}/${hash}/${fileName}`;
    try {
      stat = await fs.stat(url);
    } catch (e) {
      ctx.throw(401, "下载失败，请联系管理员！");
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'ipa';
      ctx.filePath = url;
    };
    await next();
  })
  .use('/check', checkRouter.routes(), checkRouter.allowedMethods())
  .use('/latest', latestRouter.routes(), latestRouter.allowedMethods())
  .use('/u', userRouter.routes(), userRouter.allowedMethods())
  .use('/me', meRouter.routes(), meRouter.allowedMethods())
  .use('/scoreChange', scoreChangeRouter.routes(), scoreChangeRouter.allowedMethods())
  .use('/thread', threadRouter.routes(), threadRouter.allowedMethods())
  .use('/search', searchRouter.routes(), searchRouter.allowedMethods())
  .use('/forum', forumRouter.routes(), forumRouter.allowedMethods());
module.exports = appRouter;