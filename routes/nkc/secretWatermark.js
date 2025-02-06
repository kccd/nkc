const router = require('koa-router')();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router.get(
  '/',
  OnlyOperation(Operations.nkcManagementSecretWatermark),
  async (ctx, next) => {
    const { db, data } = ctx;
    data.nav = 'secretWatermark';
    ctx.template = 'nkc/secretWatermark/secretWatermark.pug';
    await next();
  },
);
module.exports = router;
