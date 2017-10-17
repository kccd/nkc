const tools = require('./tools');
const settings = require('./settings');
const nkcModules = require('./nkcModules');
const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const bodyParser = require('koa-bodyparser');
const staticServe = require('koa-static');
const db = require('./dataModels');
const app = new Koa();
const logger = nkcModules.logger;

app.use(async (ctx, next) => {
  ctx.reqTime = new Date();
  ctx.db = db;
  ctx.nkcModules = nkcModules;
  ctx.tools = tools;
  Object.defineProperty(ctx, 'template', {
    get: function() {
      return './pages/' + this.__templateFile
    },
    set: function(fileName) {
      this.__templateFile = fileName
    }
  });
  try {
    await next();
  } catch(err) {
    ctx.error = err;
    ctx.status = err.statusCode || err.status || 500;
    if(process.ENV === 'production')
      ctx.body = {
        message: err.message
      };
    else
      ctx.body = err.toString().replace(/\|/g, '<br />')
  }
  finally {
    ctx.status = ctx.response.status;
    const passed = Date.now() - ctx.reqTime;
    ctx.set('X-Response-Time', passed);
    ctx.processTime = passed.toString();
    await logger(ctx);
  }
});
app.use(staticServe('./pages'));
app.use(bodyParser());
app.use(async (ctx, next) => {
  await next();
  const type = ctx.accepts('json', 'html');
  switch(type) {
    case 'json':
      ctx.type = 'json';
      ctx.body = ctx.data;
      break;
    default:
      ctx.type = 'html';
      try {
        ctx.body = ctx.nkcModules.render(ctx.template, ctx.data);
      } catch(e) {
        ctx.throw(500, e)
      }
  }
});
app.use(mainRouter.routes());

module.exports = app.callback();
