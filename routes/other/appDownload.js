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
  .get('/android/latest', async (ctx, next) => {
    const {fs, db, params} = ctx;
    const {version} = params;
    const q = {
      appPlatForm: 'android',
      stable: true,
      disabled: false
    };
    // 获取最新的安装包
    const androidApk = await db.AppVersionModel.findOne(q);
    if(!androidApk) ctx.throw(404, '数据不存在或暂未开放下载通道');
    const {hash} = androidApk;
    let url = `${androidSavePath}/${hash}.apk`;
    // let stat;
    // let url = `${androidSavePath}/${tid}.jpg`;
    try {
      await fs.stat(url);
    } catch(e) {
      ctx.throw(401, "安装包不存在");
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'apk';
      ctx.filePath = url
    }
    await next()
  })
  .get('/ios/:version', async (ctx, next) => {
    const {tid} = ctx.params;
    const {fs, db, tools, params} = ctx;
    // 获取最新的安装包
    const {version} = params;
    const q = {appPlatForm: 'ios'};
    if(version === 'latest') {
      q.latest = true;
    } else {
      a.appVersion = version;
    }
    const androidApk = await db.AppVersionModel.findOne(q);
    if(!androidApk) ctx.throw(404, 'not found');
    const {fileName, appVersion} = androidApk;
    let stat;
    let url = `${iosSavePath}/${appVersion}/${fileName}`;
    try {
      stat = await fs.stat(url);
    } catch(e) {
      ctx.throw(401, "下载失败，请联系管理员！");
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'ipa';
      ctx.filePath = url
    }
    await next()
  });

module.exports = router;