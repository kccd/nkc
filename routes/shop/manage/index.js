const Router = require('koa-router');
const homeRouter = require('./home');
const shelfRouter = require('./shelf');
const manageRouter = new Router();
manageRouter
  .get('/:account', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {account} = params;
    return ctx.redirect(`/shop/manage/${account}/home`);
		// ctx.template = 'shop/manage/index.pug';
    // await next();
  })
  .use('/:account/home', homeRouter.routes(), homeRouter.allowedMethods())
  .use('/:account/shelf', shelfRouter.routes(), shelfRouter.allowedMethods())
module.exports = manageRouter;