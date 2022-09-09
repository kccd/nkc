const router = require('koa-router')();
const loginRouter = require('./login');
const editorRouter = require('./editor');
router
  .use('/login', loginRouter.routes(), loginRouter.allowedMethods())
  .use('/editor', editorRouter.routes(), editorRouter.allowedMethods())
module.exports = router;
