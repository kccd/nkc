const router = require('koa-router')();
const momentRouter = require('./moment');
router.use(
  '/moment/:mid',
  momentRouter.routes(),
  momentRouter.allowedMethods(),
);
module.exports = router;
