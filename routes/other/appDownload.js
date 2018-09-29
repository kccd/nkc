const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const path = require('path');
const {upload, statics, cache} = require('../../settings');
const {androidSavePath, iosSavePath} = upload;

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a tid is required.');
    await next()
  })
  .get('/android/lastest', async (ctx, next) => {
    const {tid} = ctx.params;
    const {fs, db, tools} = ctx;
    // 获取最新的安装包
    const androidApk = await db.AppVersionModel.findOnly({lastest:true,appPlatForm:"android"});
    const {fileName, appVersion} = androidApk;
    let stat;
    let url = `${androidSavePath}/${appVersion}/${fileName}`;
    // let stat;
    // let url = `${androidSavePath}/${tid}.jpg`;
    try {
      stat = await fs.stat(url);
    } catch(e) {
      screenTopAlert("下载失败，请联系管理员！");
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'apk';
      ctx.filePath = url
    }
    await next()
  })
  .get('/ios/lastest', async (ctx, next) => {
    const {tid} = ctx.params;
    const {fs, db, tools} = ctx;
    // 获取最新的安装包
    const androidApk = await db.AppVersionModel.findOnly({lastest:true,appPlatForm:"ios"});
    const {fileName, appVersion} = androidApk;
    let stat;
    let url = `${iosSavePath}/${appVersion}/${fileName}`;
    try {
      stat = await fs.stat(url);
    } catch(e) {
      screenTopAlert("下载失败，请联系管理员！");
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'ipa';
      ctx.filePath = url
    }
    await next()
  });

module.exports = router;