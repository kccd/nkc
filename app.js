const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const path = require('path');
const koaBody = require('koa-body');
const koaCompress = require('koa-body');
const settings = require('./settings');
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
const {mkdirSync} = require('fs');
const favicon = require('koa-favicon');
const {permissions} = require('./nkcModules');
const {stayLogin, init, cookieIdentify, body, scoreHandler, urlRewrite, permission, score, logger} = require('./middlewares');

try {
  mkdirSync('tmp');
} catch(e) {
  if(e.code !== 'EEXIST')
    throw e
}

app.keys = [settings.cookie.secret];
app
  // .use(koaCompress({threshold: 2048}))
  .use(koaBody(settings.upload.koaBodySetting))
  .use(init)
  .use(stayLogin)
  .use(urlRewrite)
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
