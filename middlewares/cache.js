const moment = require("moment");
const languages = require('../languages');
require("colors");
const languageName = 'zh_cn';
const lang = (operationId) => {
  return languages[languageName]['operations'][operationId] || operationId;
};
module.exports = async (ctx, next) => {
  if(
    ctx.method !== "GET" ||
    ctx.data.user ||
    ctx.get("FROM") === "nkcAPI" ||
    ctx.filePath ||
    ctx.request.accepts('json', 'html') !== "html"
  ) return await next();
  const {state, url, settings, db, path, data} = ctx;
  const {redisClient} = settings;
  const tocKey = `page:${url}:toc`;
  const dataKey = `page:${url}:data`;
  // 获取缓存生成的时间，判断是否过期
  const toc = await redisClient.getAsync(tocKey);
  const cacheSettings = await db.SettingModel.getSettings("cache");
  if(!toc || (ctx.reqTime.getTime() - Number(toc)) > cacheSettings.visitorPageCacheTime*1000) {
    state.cachePage = true;
  } else {
    const html = await redisClient.getAsync(dataKey);
    if(!html) {
      state.cachePage = true;
    } else {
      ctx.set("Content-Type", "text/html");
      const processTime = (Date.now() - ctx.reqTime).toString();
      console.log(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' Info '.bgGreen} ${"visitor".bgCyan} ${ctx.method.black.bgYellow} ${path.bgBlue} <${processTime.green}ms> ${"200".green} ${lang(data.operationId).grey}`
      );
      const d = {
        url: ctx.path,
        method: "GET",
        status: ctx.status,
        uid: "visitor",
        reqTime: ctx.reqTime,
        resTime: processTime,
        consoleType: 'web',
        processId: global.NKC.processId,
        from: ctx.req.headers.referer,
        address: ctx.address,
        error: ''
      };
      setTimeout(async () => {
        const url_ = url.replace(/\?.*/, '');
        const tid = url_.replace(/\/t\/(.*)/i, "$1");
        if(tid !== url_) {
          await db.ThreadModel.updateOne({tid}, {$inc: {hits: 1}});
        }
        global.NKC.io.of('/console').NKC.webMessage(d);
      });
      return ctx.body = html;
    }
  }
  await next();
  if(!state.cachePage) return;
  const html = ctx.body.toString();
  setTimeout(async () => {
    await redisClient.setAsync(tocKey, ctx.reqTime.getTime());
    await redisClient.setAsync(dataKey, html);
    // 生成缓存记录
    let cache = await db.CacheModel.findOneAndUpdate({
      key: url,
      type: "visitorPage"
    }, {
      $set: {
        toc: ctx.reqTime.getTime()
      }
    });
    if(!cache) {
      await db.CacheModel({
        key: url,
        toc: ctx.reqTime.getTime(),
        type: "visitorPage"
      }).save();
    }
  });
};