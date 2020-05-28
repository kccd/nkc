module.exports = async (ctx, next) => {
  const {state, url, settings, db} = ctx;

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
    if(state.platform === 'reactNative') {
      tocKey = `app:RN:page:${url}:toc`;
      dataKey = `app:RN:page:${url}:data`;
    } else {
      tocKey = `app:AC:page:${url}:toc`;
      dataKey = `app:AC:page:${url}:data`;
    }
  }
  const cacheSettings = await db.SettingModel.getSettings("cache");

  // 获取缓存生成的时间，判断是否过期
  const toc = await redisClient.getAsync(tocKey);
  if(!toc || (ctx.reqTime.getTime() - Number(toc)) > cacheSettings.visitorPageCacheTime*1000) {
    state.cachePage = true;
  } else {
    const html = await redisClient.getAsync(dataKey);
    if(!html) {
      state.cachePage = true;
    } else {
      // 记录并在控制台打印日志
      ctx.set("Content-Type", "text/html");
      ctx.logIt = true;
      // 阅读文章则文章浏览量加一
      const url_ = url.replace(/\?.*/, '');
      const tid = url_.replace(/\/t\/(.*)/i, "$1");
      if(tid !== url_) {
        await db.ThreadModel.updateOne({tid}, {$inc: {hits: 1}});
      }
      return ctx.body = html;
    }
  }
  await next();
  // 如果不需要缓存页面或请求的是文件，则不建立缓存
  if(ctx.filePath ||!state.cachePage) return;
  const html = ctx.body.toString();
  setImmediate(async () => {
    await redisClient.setAsync(tocKey, ctx.reqTime.getTime());
    await redisClient.setAsync(dataKey, html);
    // 生成缓存记录
    const cache = await db.CacheModel.findOneAndUpdate({
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
