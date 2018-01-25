const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const path = require('path');
const koaBody = require('koa-body');
const settings = require('./settings');
const staticServe = path => {
  return require('koa-static')(path, {
    setHeaders: function(response, path, stats) {
      response.setHeader('Cache-Control', 'public, no-cache')
    }
  });
};
const app = new Koa();
const {mkdirSync} = require('fs');
const favicon = require('koa-favicon');
const {permissions} = require('./nkcModules');
const {init, cookieIdentify, body, scoreHandler, urlrewrite} = require('./middlewares');

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
  .use(staticServe(path.resolve('./nkcModules')))
  .use(staticServe(path.resolve('./node_modules')))
  .use(staticServe(path.resolve('./pages')))
  .use(favicon(__dirname + '/resources/site_specific/favicon.ico'))
  .use(permissions)
  .use(scoreHandler)
  .use(mainRouter.routes())
  .use(body);
module.exports = app.callback();
