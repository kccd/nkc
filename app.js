const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const koaBody = require('koa-body');
const staticServe = require('koa-static');
const app = new Koa();
app.proxy = true;
const {mkdirSync} = require('fs');
const favicon = require('koa-favicon');
const {permissions} = require('./nkcModules');
const {init, cookieIdentify, body, scoreHandler, urlrewrite} = require('./middlewares');
const settings = require('./settings');

try {
  mkdirSync('tmp');
} catch(e) {
  if(e.code !== 'EEXIST')
    throw e
}

app.keys = [settings.cookie.secret];
app.use(init)
  .use(cookieIdentify)
  .use(koaBody(settings.upload.koaBodySetting))
  .use(async (ctx, next) => {
    ctx.body = ctx.request.body;
    await next()
  })
  .use(urlrewrite)
  .use(staticServe('./pages'))
  .use(staticServe('./node_modules'))
  .use(staticServe('./nkcModules'))
  .use(favicon(__dirname + '/resources/site_specific/favicon.ico'))
  .use(permissions)
  .use(scoreHandler)
  .use(mainRouter.routes())
  .use(body);
module.exports = app.callback();
