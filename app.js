const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const path = require('path');
const koaBody = require('koa-body');
const koaCompress = require('koa-compress');
const settings = require('./settings');
const rateLimit = require('koa-ratelimit');
const Redis = require('ioredis');
const fs = require('fs');
const helmet = require('koa-helmet');
const static = require('awesome-static');
const staticServe = path => {
  return require('koa-static')(path, {
    setHeaders: function(response, path, stats) {
      response.setHeader('Cache-Control', `public, ${global.NKC.NODE_ENV==='production'?'max-age=604800': 'no-cache'}`)
    }
  });
};
const app = new Koa();
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
app.on('error', err => {
	if(!['read ECONNRESET', 'write ECONNABORTED', 'write ECANCELED', 'write ECONNRESET'].includes(err.message)) {
		console.log(err);
	}
});
const favicon = require('koa-favicon');

const {stayLogin, init, body, urlRewrite, permission, logger, cache} = require('./middlewares');

const cookieConfig = require("./config/cookie");

app.keys = [cookieConfig.secret];
app
  // 限制单位时间相同ip（60s）请求数
  .use(rateLimit({
    db: new Redis(),
    duration: 60000,
    errorMessage: fs.readFileSync('./pages/error/503.html').toString(),
    id: (ctx) => {
      const {req, ip} = ctx;
      return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || ip;
    },
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    max: 2000,
    disableHeader: false,
  }))
  // 限制单位时间（60s）所有请求数
  .use(rateLimit({
    db: new Redis(),
    duration: 60000,
    errorMessage: fs.readFileSync('./pages/error/503.html').toString(),
    id: () => {
      return 'nkc'
    },
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    max: 300000,
    disableHeader: false,
  }))
  // gzip
  .use(koaCompress({threshold: 2048}))
  // 静态文件映射
  .use(staticServe(path.resolve('./nkcModules')))
  .use(staticServe(path.resolve('./public')))
  .use(staticServe(path.resolve('./node_modules')))
  .use(staticServe(path.resolve('./pages')))
  .use(favicon(__dirname + '/public/statics/site/favicon.ico'))
  .use(static("./resources/tools", {route: "/tools"}))
  // 请求头安全设置
  .use(helmet())
  .use(koaBody(settings.upload.koaBodySetting))
  // 视频段支持
  .use(conditional())
  .use(etag())
  .use(urlRewrite)
  .use(async (ctx, next) => {
    ctx._time = Date.now();
    await next();
  })
  .use(init)
  .use(async (ctx, next) => {
    console.log(`init: ${Date.now() - ctx._time}ms`);
    ctx._time = Date.now();
    await next();
  })
  .use(stayLogin)
  .use(async (ctx, next) => {
    console.log(`stayLogin: ${Date.now() - ctx._time}ms`);
    ctx._time = Date.now();
    await next();
  })
  .use(cache)
  .use(async (ctx, next) => {
    console.log(`cache: ${Date.now() - ctx._time}ms`);
    ctx._time = Date.now();
    await next();
  })
  .use(permission)
  .use(async (ctx, next) => {
    console.log(`permission: ${Date.now() - ctx._time}ms`);
    ctx._time = Date.now();
    await next();
  })
  .use(logger)
  .use(async (ctx, next) => {
    console.log(`logger: ${Date.now() - ctx._time}ms`);
    ctx._time = Date.now();
    await next();
  })
  .use(mainRouter.routes())
  .use(async (ctx, next) => {
    console.log(`mainRouter: ${Date.now() - ctx._time}ms`);
    ctx._time = Date.now();
    await next();
  })
  .use(body)
  .use(async (ctx, next) => {
    console.log(`body: ${Date.now() - ctx._time}ms`);
    ctx._time = Date.now();
    await next();
  });
module.exports = app.callback();
