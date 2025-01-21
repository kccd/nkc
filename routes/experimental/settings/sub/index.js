const Router = require('koa-router');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const router = new Router();
router
  .get(
    '/',
    OnlyOperation(Operations.experimentalSubSettings),
    async (ctx, next) => {
      const { db, data } = ctx;
      data.subSettings = await db.SettingModel.getSettings('subscribe');
      ctx.template = 'experimental/settings/sub/sub.pug';
      await next();
    },
  )
  .put(
    '/',
    OnlyOperation(Operations.experimentalSubSettings),
    async (ctx, next) => {
      const { db, body } = ctx;
      let { subUserCountLimit, subForumCountLimit, subColumnCountLimit } = body;
      subUserCountLimit = Math.round(Number(subUserCountLimit));
      subForumCountLimit = Math.round(Number(subForumCountLimit));
      subColumnCountLimit = Math.round(Number(subColumnCountLimit));
      if (
        subUserCountLimit < 0 ||
        subForumCountLimit < 0 ||
        subColumnCountLimit < 0
      ) {
        ctx.throw(400, '数量不能小于0');
      }
      await db.SettingModel.updateOne(
        {
          _id: 'subscribe',
        },
        {
          $set: {
            'c.subUserCountLimit': subUserCountLimit,
            'c.subForumCountLimit': subForumCountLimit,
            'c.subColumnCountLimit': subColumnCountLimit,
          },
        },
      );
      await db.SettingModel.saveSettingsToRedis('subscribe');
      await next();
    },
  );
module.exports = router;
