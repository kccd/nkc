const Router = require('koa-router');

const historiesRouter = new Router();

historiesRouter
  .get('/', async (ctx, next) => {
    const {nkcModules, data, db, query} = ctx;
    const {page = 0, os = 'android'} = query;
    data.type = 'histories';
    data.os = os;
    const count = await db.AppVersionModel.count({appPlatForm: os});
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    data.histories = await db.AppVersionModel.find({appPlatForm: os}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    ctx.template = 'experimental/settings/app.pug';
    await next();
  });

module.exports = historiesRouter;