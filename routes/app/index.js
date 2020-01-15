const Router = require('koa-router');
const appRouter = new Router();
const checkRouter = require('./check');
const navRouter = require("./nav");
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
    }
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
    }
    await next();
  })
  .use("/nav", navRouter.routes(), navRouter.allowedMethods())
  .use('/check', checkRouter.routes(), checkRouter.allowedMethods());
module.exports = appRouter;
