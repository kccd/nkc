const moment = require("moment");
const languages = require('../languages');
require("colors");
const languageName = 'zh_cn';
const lang = (operationId) => {
  return languages[languageName]['operations'][operationId] || operationId;
};
module.exports = async (ctx, next) => {
  const {state, url, settings, db, path, data, method} = ctx;
  const {operationId} = data;

  if(
    ctx.method !== "GET" ||
    ctx.data.user ||
    ctx.get("FROM") === "nkcAPI" ||
    ctx.filePath ||
    ctx.request.accepts('json', 'html') !== "html" ||
    global.NKC.NODE_ENV !== "production"
  ) return await next();

  // 记录游客最近浏览的10个页面URL，当游客登录后跳转到最新的那个页面。
  const loginSettings = await db.SettingModel.getSettings("login");
  if(method === "GET" && loginSettings.redirectOperationsId && loginSettings.redirectOperationsId.includes(operationId)) {
    // 将最近十次访问的url，写入cookie
    const urls = ctx.getCookie("visitedUrls") || [];
    if(urls.length >= 10) {
      urls.splice(urls.length-1, 1);
    }
    urls.unshift(url);
    ctx.setCookie("visitedUrls", urls);
  }

  const {redisClient} = settings;
  let tocKey = `page:${url}:toc`;
  let dataKey = `page:${url}:data`;
  
  if(state.isApp) {
    tocKey = `app:page:${url}:toc`;
    dataKey = `app:page:${url}:toc`;
  }
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
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' Info '.bgGreen} ${"visitor".bgCyan} ${ctx.method.green} ${path.bgBlue} <${processTime.green}ms> ${"200".green} ${lang(data.operationId).grey}`
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
      const visitorLog = db.VisitorLogModel({
        path: ctx.path,
        query: ctx.query,
        status: ctx.status,
        method: ctx.method,
        ip: ctx.address,
        port: ctx.port,
        operationId: operationId,
        reqTime: ctx.reqTime,
        processTime: processTime,
        referer: ctx.get("referer"),
        userAgent: ctx.get("User-Agent")
      });
      setImmediate(async () => {
        const url_ = url.replace(/\?.*/, '');
        const tid = url_.replace(/\/t\/(.*)/i, "$1");
        if(tid !== url_) {
          await db.ThreadModel.updateOne({tid}, {$inc: {hits: 1}});
        }
        await visitorLog.save();
        global.NKC.io.of('/console').NKC.webMessage(d);
      });
      return ctx.body = html;
    }
  }
  await next();
  if(ctx.filePath ||!state.cachePage) return;
  const html = ctx.body.toString();
  setImmediate(async () => {
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