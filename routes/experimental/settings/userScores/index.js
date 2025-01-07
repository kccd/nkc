const Router = require('koa-router');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.getUserAllScores),
  async (ctx, next) => {
    let { query, db, data } = ctx;
    let { uid } = query;
    data.scores = await db.UserModel.getUserScores(uid);
    return next();
  },
);

module.exports = router;
