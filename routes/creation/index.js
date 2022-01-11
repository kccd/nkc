const router = require('koa-router')();
const materialRouter = require('./material');
const materialsRouter = require('./materials');
const booksRouter = require('./books');
const bookRouter = require('./book');
const articlesRouter = require('./articles');
const documentRouter = require('./document');
const addChapterRouter = require('./addChapter');
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
  .use('/materials', materialsRouter.routes(), materialsRouter.allowedMethods())
  .use('/material', materialRouter.routes(), materialRouter.allowedMethods())
  .use('/books', booksRouter.routes(), booksRouter.allowedMethods())
  .use('/book', bookRouter.routes(), bookRouter.allowedMethods())
  .use('/articles', articlesRouter.routes(), articlesRouter.allowedMethods())
  .use('/document', documentRouter.routes(), documentRouter.allowedMethods())
  .use('/addChapter', addChapterRouter.routes(), addChapterRouter.allowedMethods())
module.exports = router;
