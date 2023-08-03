const router = require('koa-router')();
const tagsRouter = require('./tags');
const tagRouter = require('./tag');
const publicRouter = require('./public');
const questionRouter = require('./question');
const questionsRouter = require('./questions');
router
  .use(
    '/question/:questionId',
    questionRouter.routes(),
    questionRouter.allowedMethods(),
  )
  .use('/questions', questionsRouter.routes(), questionsRouter.allowedMethods())
  .use('/tags', tagsRouter.routes(), tagsRouter.allowedMethods())
  .use('/tag/:tagId', tagRouter.routes(), tagRouter.allowedMethods())
  .use('/public', publicRouter.routes(), publicRouter.allowedMethods());
module.exports = router;
