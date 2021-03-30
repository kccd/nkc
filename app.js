const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const path = require('path');
const koaBody = require('koa-body');
const koaCompress = require('koa-compress');
const settings = require('./settings');
const helmet = require('koa-helmet');
const awesomeStatic = require('awesome-static');
const staticServe = path => {
  return require('koa-static')(path, {
    setHeaders: function(response, path, stats) {
      response.setHeader('Cache-Control', `public, ${global.NKC.NODE_ENV==='production'?'max-age=604800': 'no-cache'}`)
    }
  });
};
const app = new Koa({
  proxy: true,
  maxIpsCount: 1,
});
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
app.on('error', err => {
  console.log(`KOA ERROR:`);
  console.error(err);
	/*if(!['read ECONNRESET', 'write ECONNABORTED', 'write ECANCELED', 'write ECONNRESET'].includes(err.message)) {
		console.log(err);
	}*/
});
const favicon = require('koa-favicon');

const {rateLimit, stayLogin, init, body, urlRewrite, permission, logger, cache} = require('./middlewares');

const cookieConfig = require("./config/cookie");

app.keys = [cookieConfig.secret];
app
  .use(async (ctx, next) => {
    ctx.address = ctx.ip.replace(/^::ffff:/, '');
    ctx.port = ctx.get(`X-Forwarded-Remote-Port`) || ctx.req.connection.remotePort;
    await next();
  })
  .use(rateLimit.total)
  // gzip
  .use(koaCompress({threshold: 2048}))
  // 静态文件映射
  .use(staticServe(path.resolve('./nkcModules')))
  .use(staticServe(path.resolve('./public')))
  .use(staticServe(path.resolve('./node_modules')))
  .use(staticServe(path.resolve('./pages')))
  .use(favicon(__dirname + '/public/statics/site/favicon.ico'))
  .use(awesomeStatic("./resources/tools", {route: "/tools"}))
  // 请求头安全设置
  .use(helmet())
  .use(koaBody(settings.upload.koaBodySetting))
  // 视频段支持
  .use(conditional())
  .use(etag())
  .use(urlRewrite)
  .use(init)
  // 全局 频次限制 文件

  .use(rateLimit.totalFile)
  .use(rateLimit.totalHtml)

  .use(rateLimit.userFile)
  .use(rateLimit.userHtml)

  .use(stayLogin)
  .use(cache)
  .use(permission)
  .use(logger)
  .use(mainRouter.routes())
  .use(body);
module.exports = app.callback();
