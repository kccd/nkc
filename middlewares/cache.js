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
  const toc = await redisClient.getAsync(`page:${url}:toc`);
  const cacheSettings = await db.SettingModel.getSettings("cache");
  if(!toc || (ctx.reqTime.getTime() - Number(toc)) > cacheSettings.visitorPageCacheTime*1000) {
    state.cachePage = true;
  } else {
    const html = await redisClient.getAsync(`page:${url}:data`);
    if(!html) {
      state.cachePage = true;
    } else {
      ctx.set("Content-Type", "text/html");
      const processTime = (Date.now() - ctx.reqTime).toString();
      console.log(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' Info '.bgGreen} ${"visitor".bgCyan} ${ctx.method.black.bgYellow} ${path.bgBlue} <${processTime.green}ms> ${"200".green} ${lang(data.operationId).grey}`
      );
      return ctx.body = html;
    }
  }
  await next();
  if(!state.cachePage) return;
  const html = ctx.body.toString();
  setTimeout(async () => {
    await redisClient.setAsync(`page:${url}:toc`, ctx.reqTime.getTime());
    await redisClient.setAsync(`page:${url}:data`, html);
  });
};