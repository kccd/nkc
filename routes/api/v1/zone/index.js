const router = require('koa-router')();
const momentRouter = require('./moment');
router.use('/moment', momentRouter.routes(), momentRouter.allowedMethods());
module.exports = router;
