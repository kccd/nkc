const router = require('koa-router')();
const tagsRouter = require('./tags');
const tagRouter = require('./tag');
router
  .use('/tags', tagsRouter.routes(), tagsRouter.allowedMethods())
  .use('/tag/:tagId', tagRouter.routes(), tagRouter.allowedMethods());
module.exports = router;
