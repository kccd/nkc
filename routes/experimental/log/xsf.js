const Router = require('koa-router');
const xsfRouter = new Router();
xsfRouter
  .get('/', async (ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {page = 0} = query;
    await next();
  });
module.exports = xsfRouter;
