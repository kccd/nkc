const Router = require('koa-router');
const loginRecordRouter = new Router();
const { OnlyUser } = require('../../../middlewares/permission');
loginRecordRouter.put('/', OnlyUser(), async (ctx, next) => {
  const { data, db, body } = ctx;
  const { user } = data;
  const { loginRecordId } = body;
  await db.UsersPersonalModel.updateOne(
    { uid: user.uid },
    { $pullAll: { secret: [loginRecordId] } },
  );
  await next();
});
module.exports = loginRecordRouter;
