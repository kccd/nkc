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

  // 仅仅只针对游客建立缓存
  if(
    ctx.method !== "GET" ||
    ctx.data.user ||
    ctx.get("FROM") === "nkcAPI" || // 排除nkcAPI的请求
    ctx.filePath || // 排除资源文件
    ctx.request.accepts('json', 'html') !== "html" || // 排除非html
    global.NKC.NODE_ENV !== "production" // 排除开发环境
  ) return await next();

  const {redisClient} = settings;
  // 缓存时间的键名
  let tocKey = `page:${url}:toc`;
  // 缓存内容的键名
  let dataKey = `page:${url}:data`;

  // 同上，但由于APP需要排除页面头尾，所以缓存和web端不公用。
  if(state.isApp) {
    tocKey = `app:page:${url}:toc`;
    dataKey = `app:page:${url}:data`;
  }
  const cacheSettings = await db.SettingModel.getSettings("cache");

  /* 缓存优化，存在多进程无法共享同一个Promise的问题，待解决，可能需要借助redis的发布/订阅。
  const getCache = async (tocKey, dataKey) => {
    let html;
    const toc = await redisClient.getAsync(tocKey);
    if(!toc || (ctx.reqTime.getTime() - Number(toc)) > cacheSettings.visitorPageCacheTime*1000) {
      state.cachePage = true;
    } else {
      html = await redisClient.getAsync(dataKey);
      if(!html) state.cachePage = true;
    }
    if(!state.cachePage) return Promise.resolve(html);
    if(!_caches[dataKey]) {
      _caches[dataKey] = new Promise((resolve, reject) => {
        next()
          .then(async () => {
            html = ctx.body;
            await redisClient.setAsync(tocKey, ctx.reqTime.getTime());
            await redisClient.setAsync(dataKey, html);
            resolve(html);
          })
          .catch(reject)
          .finally(() => {
            delete _caches[dataKey];
          });
      });
    }
    return _caches[dataKey];
  };


  const html_ = await getCache(tocKey, dataKey);
  return ctx.body = html_;*/


  // 获取缓存生成的时间，判断是否过期
  const toc = await redisClient.getAsync(tocKey);
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
        const logSettings = state.logSettings;
        if(logSettings.operationsId && logSettings.operationsId.includes(operationId)) {
          await visitorLog.save();
        }
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