const Router = require('koa-router');
const loginRecordRouter = new Router();
loginRecordRouter.put('/', async (ctx, next) => {
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
