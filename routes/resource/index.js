const Router = require('koa-router');
const resourceRouter = new Router();
const {promisify} = require('util');


resourceRouter
  .get('/', async (ctx, next) => {
    ctx.throw(404, 'a resource ID is required.');
    await next()
  })
  .post('/', async (ctx, next) => {
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    console.log(rid);
  });

module.exports = resourceRouter;