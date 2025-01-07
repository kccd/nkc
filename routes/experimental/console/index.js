const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.visitExperimentalConsole),
  async (ctx, next) => {
    ctx.template = 'experimental/console/console.pug';
    await next();
  },
);
module.exports = router;
