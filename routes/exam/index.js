const Router = require('koa-router');
const examRouter = new Router();
const categoryRouter = require('./category');
const questionRouter = require('./question');
const paperRouter = require('./paper');
const editorRouter = require('./editor');
examRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = 'exam/home.pug';
    data.examsCategories = await db.ExamsCategoryModel.find({$or: [
        {
          disabledA: {$ne: true}
        },
        {
          disabledB: {$ne: true}
        }
      ]}).sort({order: 1});
    await next();
  })
  .use('/paper', paperRouter.routes(), paperRouter.allowedMethods())
  .use('/question', questionRouter.routes(), questionRouter.allowedMethods())
  .use('/editor', editorRouter.routes(), editorRouter.allowedMethods())
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods());

module.exports = examRouter;