const router = require('koa-router')();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router.get(
  '/',
  OnlyOperation(Operations.nkcManagementSection),
  async (ctx, next) => {
    const { db, data } = ctx;
    data.nav = 'section';
    ctx.template = 'nkc/section/section.pug';
    await next();
  },
);
module.exports = router;
