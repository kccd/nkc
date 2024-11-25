const Router = require('koa-router');
const router = new Router();
const editorRouter = require('./editor');
const rollbackRouter = require('./rollback');
router.use('/editor', editorRouter.routes(), editorRouter.allowedMethods());
router.use(
  '/rollback',
  rollbackRouter.routes(),
  rollbackRouter.allowedMethods(),
);
module.exports = router;
