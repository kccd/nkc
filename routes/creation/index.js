const router = require('koa-router')();
const materialRouter = require('./material');
const booksRouter = require('./books');
const bookRouter = require('./book');
const articlesRouter = require('./articles');
router
  .use('/', async (ctx, next) => {
    if(ctx.query.t) {
      ctx.template = 'creation/index.pug';
    } else {
      ctx.remoteTemplate = 'creation/index.pug';
    }
    await next();
  })
  .get('/', async (ctx, next) => {
    await next();
  })
  .use('/material', materialRouter.routes(), materialRouter.allowedMethods())
  .use('/books', booksRouter.routes(), booksRouter.allowedMethods())
  .use('/book', bookRouter.routes(), bookRouter.allowedMethods())
  .use('/articles', articlesRouter.routes(), articlesRouter.allowedMethods())
module.exports = router;