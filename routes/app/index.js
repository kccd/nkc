const Router = require('koa-router');
const appRouter = new Router();
const checkRouter = require('./check');
const navRouter = require("./nav");
const { upload } = require('../../settings');
const { androidSavePath, iosSavePath } = upload;
appRouter
  .get('/', async (ctx, next) => {
    const { db, data } = ctx;
    data.stable = await db.AppVersionModel.findOne({
      appPlatForm: "android",
      stable: true,
      disabled: false
    });
    ctx.template = 'app/index.pug';
    await next();
  })
  .get('/android/:hash', async (ctx, next) => {
    const { fs, db, params } = ctx;
    const { hash } = params;
    const q = {
      appPlatForm: 'android',
      hash
    };
    // 获取最新的安装包
    const app = await db.AppVersionModel.findOne(q);
    if (!app) ctx.throw(404, "未找到相关数据");
    if(app.disabled) ctx.throw(403, "此版本下载通道已关闭");
    const path = `${androidSavePath}/${hash}.apk`;
    try{
      await fs.access(path);
    } catch(err) {
      ctx.throw(404, "安装包不存在或已被删除");
    }
    ctx.type = "apk";
    ctx.filePath = path;
    await next();
  })
  .get('/ios/:hash', async (ctx, next) => {
    const { fs, db, params } = ctx;
    const { hash } = params;
    const q = {
      appPlatForm: 'ios',
      hash
    };
    // 获取最新的安装包
    const app = await db.AppVersionModel.findOne(q);
    if (!app) ctx.throw(404, "未找到相关数据");
    if(app.disabled) ctx.throw(403, "此版本下载通道已关闭");
    const url = `${iosSavePath}/${hash}.ipa`;
    try{
      await fs.access(url);
    } catch(err) {
      ctx.throw(404, "安装包不存在或已被删除");
    }
    ctx.type = "ipa";
    ctx.filePath = url;
    await next();
  })
  .get('/location', async (ctx, next) => {
    const {data, nkcModules} = ctx;
    data.location = nkcModules.location;
    await next();
  })
  .use("/nav", navRouter.routes(), navRouter.allowedMethods())
  .use('/check', checkRouter.routes(), checkRouter.allowedMethods());
module.exports = appRouter;
