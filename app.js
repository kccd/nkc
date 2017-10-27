const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const koaBody = require('koa-body');
const staticServe = require('koa-static');
const app = new Koa();
const {mkdirSync} = require('fs');
const favicon = require('koa-favicon');
const {permissions} = require('./nkcModules');
const {init, cookieIdentify, body} = require('./middlewares');
const settings = require('./settings');

try {
  mkdirSync('tmp');
} catch(e) {
  if(e.code !== 'EEXIST')
    throw e
}

app.keys = [settings.cookie.secret];
app.use(init);
app.use(koaBody(settings.upload.koaBodySetting));
app.use(async (ctx, next) => {
  ctx.body = ctx.request.body;
  await next()
});
app.use(cookieIdentify);
app.use(staticServe('./pages'));
app.use(staticServe('./node_modules'));
app.use(staticServe('./nkcModules'));
app.use(favicon(__dirname + '/resources/site_specific/favicon.ico'));
app.use(permissions);
app.use(mainRouter.routes());
app.use(body);
module.exports = app.callback();
