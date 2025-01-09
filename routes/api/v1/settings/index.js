const Router = require('koa-router');
const router = new Router();
const publishRouter = require('./publish');
router.use('/publish', publishRouter.routes(), publishRouter.allowedMethods());
module.exports = router;
