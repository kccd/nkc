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
  Object.defineProperty(ctx, 'template', {
    template: {
      get: () => './pages/' + this.__templateFile,
      set: fileName => this.__templateFile = fileName
    }
  });
  try {
    await next();
    ctx.status = ctx.response.status
  }
  catch (err) {
    ctx.error = err;
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.stack
    };
  }
  finally {
    const passed = Date.now() - ctx.reqTime;
    ctx.set('X-Response-Time', String(passed));
    await logger(ctx);
  }
});
app.use(staticServe('./pages'));
app.use(bodyParser());
app.use(mainRouter.routes());
app.use(async (ctx, next) => {
  switch(ctx.type) {
    case 'text/html':
      ctx.body = ctx.nkcModules.render(ctx.template, {data: ctx.data});
      break;
    case 'application/json':
      ctx.body = ctx.data;
      break;
  }
  next();
});

module.exports = app.callback();
