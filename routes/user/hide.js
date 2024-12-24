const Router = require('koa-router');
const router = new Router();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router.post('/', OnlyOperation(Operations.hideUserHome), async (ctx, next) => {
  const { data, db, params } = ctx;
  const { setHidden } = ctx.request.body;
  const { uid } = params;
  await db.UserModel.updateOne(
    { uid },
    {
      $set: {
        hidden: setHidden,
      },
    },
  );
  data.result = true;
  return next();
});
module.exports = router;
