const tools = require('./tools');
const settings = require('./settings');
const nkcModules = require('./nkcModules');
const mainRouter = require('./routes');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const staticServe = require('koa-static');
const db = require('./dataModels');
const app = new Koa();
const logger = nkcModules.logger;

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message
    };
  }
});
app.use(async (ctx, next) => {
  logger.log(ctx.path);
  await next()
});
app.use(async (ctx, next) => {
  ctx.db = db;
  ctx.nkcModules = nkcModules;
  await next();
})
app.use(staticServe('./pages'));
app.use(bodyParser());
app.use(mainRouter.routes());
module.exports = app.callback();
