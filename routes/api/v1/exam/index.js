const router = require('koa-router')();
const tagsRouter = require('./tags');
const tagRouter = require('./tag');
const publicRouter = require('./public');
router
  .use('/tags', tagsRouter.routes(), tagsRouter.allowedMethods())
  .use('/tag/:tagId', tagRouter.routes(), tagRouter.allowedMethods())
  .use('/public', publicRouter.routes(), publicRouter.allowedMethods());
module.exports = router;
