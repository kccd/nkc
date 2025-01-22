const Router = require('koa-router');
const router = new Router();
const financeRouter = require('./finance');
const contributeRouter = require('./contribute');
const subscribeReouter = require('./subscribes');
const subTypesRouter = require('./subscribeTypes');
const { OnlyUnbannedUser, OnlyUser } = require('../../middlewares/permission');
router
  .get('/subscribe_settings', OnlyUser(), async (ctx, next) => {
    const { db, data } = ctx;
    const generalSettings = await db.UsersGeneralModel.findOne(
      { uid: data.user.uid },
      {
        subscribeSettings: 1,
      },
    );
    data.subscribeSettings = {
      selectTypesWhenSubscribe:
        generalSettings.subscribeSettings.selectTypesWhenSubscribe,
    };
    await next();
  })
  .use(
    '/subscribe_types',
    subTypesRouter.routes(),
    subTypesRouter.allowedMethods(),
  )
  .use(
    '/subscribes',
    subscribeReouter.routes(),
    subscribeReouter.allowedMethods(),
  )
  .use(
    '/contribute',
    contributeRouter.routes(),
    contributeRouter.allowedMethods(),
  )
  .use('/finance', financeRouter.routes(), financeRouter.allowedMethods());
module.exports = router;
