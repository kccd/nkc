const tools = require('./tools');
const settings = require('./settings');
const nkcModules = require('./nkcModules');
const mainRouter = require('./routes');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const staticServe = require('koa-static');
const app = new Koa();
const logger = nkcModules.logger;

app.use(async (ctx, next) => {
  const start = Date.now();
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message
    };
  } finally {
    const passed = Date.now() - start;
    ctx.set('X-Response-Time', passed);
    logger.info(ctx.method + ': ' + ctx.req.url);
  }
});
app.use(async (ctx, next) => {
  await next()
});
app.use(staticServe('./pages'));
app.use(bodyParser());
app.use(mainRouter.routes());
module.exports = app.callback();
