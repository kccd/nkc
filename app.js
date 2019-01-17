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

const staticServe = path => {
  return require('koa-static')(path, {
    setHeaders: function(response, path, stats) {
      response.setHeader('Cache-Control', `public, ${process.env.NODE_ENV==='production'?'max-age=604800': 'no-cache'}`)
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

const {stayLogin, init, body, urlRewrite, permission, logger} = require('./middlewares');

app.keys = [settings.cookie.secret];
app
  // 限制单位时间相同ip（60s）请求数
  .use(rateLimit({
    db: new Redis(),
    duration: 60000,
    errorMessage: fs.readFileSync('./pages/error/503.html').toString(),
    id: (ctx) => {
      const XFF = ctx.get('X-Forwarded-For');
      return XFF || ctx.ip;
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
  // 请求头安全设置
  .use(helmet())
  // gzip
  .use(koaCompress({threshold: 2048}))
  .use(koaBody(settings.upload.koaBodySetting))
  .use(init)
  .use(stayLogin)
  .use(urlRewrite)
  // 视频段支持
  .use(conditional())
  .use(etag())
  .use(staticServe(path.resolve('./nkcModules')))
  .use(staticServe(path.resolve('./node_modules')))
  .use(staticServe(path.resolve('./pages')))
  .use(favicon(__dirname + '/resources/site_specific/favicon.ico'))
  .use(logger)
	.use(permission)
  .use(mainRouter.routes())
  .use(body);
module.exports = app.callback();
