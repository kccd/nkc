const router = require('koa-router')();
const materialRouter = require('./material');
const materialsRouter = require('./materials');
const booksRouter = require('./books');
const bookRouter = require('./book');
const articlesRouter = require('./articles');
const categoriesRouter = require('./categories');
const categoryRouter = require('./category');
const draftsRouter = require('./drafts');
const draftRouter = require('./draft');
router
  .use('/', async (ctx, next) => {
    if(ctx.query.t) {
      ctx.template = 'creation/index.pug';
    } else {
      ctx.remoteTemplate = 'creation/index.pug';
    }
    ctx.state.navbar = 'full';
    await next();
  })
  .get('/', async (ctx, next) => {
    await next();
  })
  .use('/materials', materialsRouter.routes(), materialsRouter.allowedMethods())
  .use('/material', materialRouter.routes(), materialRouter.allowedMethods())
  .use('/categories', categoriesRouter.routes(), categoriesRouter.allowedMethods())
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/books', booksRouter.routes(), booksRouter.allowedMethods())
  .use('/book', bookRouter.routes(), bookRouter.allowedMethods())
  .use('/articles', articlesRouter.routes(), articlesRouter.allowedMethods())
  .use('/drafts', draftsRouter.routes(), draftsRouter.allowedMethods())
  .use('/draft', draftRouter.routes(), draftRouter.allowedMethods())
module.exports = router;
