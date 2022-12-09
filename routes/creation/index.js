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
const communityRouter = require('./community');
const columnRouter = require('./column');
const editorRouter = require('./editor');
const zoneRouter = require('./zone');
const collectionRouter = require('./collections');
const homeRouter = require('./home');
const blackListRouter = require('./blackList');
router
  .use('/', async (ctx, next) => {
    const {data, state, db} = ctx;
    if(ctx.query.t) {
      ctx.template = 'vueRoot/index.pug';
    } else {
      ctx.remoteTemplate = 'vueRoot/index.pug';
    }
    const columnPermission = await db.UserModel.ensureApplyColumnPermission(data.user);
    const userColumn = await db.UserModel.getUserColumn(state.uid);
    data.column = {
      userColumn: userColumn,
      columnPermission: columnPermission,
      addedToColumn: state.addedToColumn
    };
    // 取网站代号
    let serverSetting = await db.SettingModel.getSettings("server");
    data.websiteCode = String(serverSetting.websiteCode).toLocaleUpperCase();
    ctx.state.navbar = 'full';
    await next();
  })
  .get('/', async (ctx, next) => {
    await next();
  })
  .use('/home', homeRouter.routes(), homeRouter.allowedMethods())
  .use('/materials', materialsRouter.routes(), materialsRouter.allowedMethods())
  .use('/material', materialRouter.routes(), materialRouter.allowedMethods())
  .use('/categories', categoriesRouter.routes(), categoriesRouter.allowedMethods())
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/books', booksRouter.routes(), booksRouter.allowedMethods())
  .use('/book', bookRouter.routes(), bookRouter.allowedMethods())
  .use('/articles', articlesRouter.routes(), articlesRouter.allowedMethods())
  .use('/drafts', draftsRouter.routes(), draftsRouter.allowedMethods())
  .use('/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/community', communityRouter.routes(), communityRouter.allowedMethods())
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods())
  .use('/editor', editorRouter.routes(), editorRouter.allowedMethods())
  .use('/zone', zoneRouter.routes(), zoneRouter.allowedMethods())
  .use('/collections', collectionRouter.routes(), collectionRouter.allowedMethods())
  .use('/blackLists', blackListRouter.routes(), blackListRouter.allowedMethods())
module.exports = router;
