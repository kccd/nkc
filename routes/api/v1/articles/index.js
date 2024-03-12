const router = require('koa-router')();
const selectorRouter = require('./selector');
const contributeRouter = require('./contribute');
router.use(
  '/selector',
  selectorRouter.routes(),
  selectorRouter.allowedMethods(),
);
router.use(
  '/contribute',
  contributeRouter.routes(),
  contributeRouter.allowedMethods(),
);
module.exports = router;
