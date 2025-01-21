const Router = require('koa-router');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const router = new Router();
router
  .get(
    '/',
    OnlyOperation(Operations.experimentalToppingSettings),
    async (ctx, next) => {
      const { data, db } = ctx;
      data.toppingSettings = await db.SettingModel.getSettings('topping');
      data.roles = await db.RoleModel.find().sort({ toc: 1 });
      data.grades = await db.UsersGradeModel.find().sort({ toc: 1 });
      ctx.template = 'experimental/settings/topping/topping.pug';
      await next();
    },
  )
  .put(
    '/',
    OnlyOperation(Operations.experimentalToppingSettings),
    async (ctx, next) => {
      const { data, body, db } = ctx;
      let { rolesId, defaultRoleGradesId } = body;
      const roles = await db.RoleModel.find({ _id: { $in: rolesId } });
      rolesId = roles.map((r) => r._id);
      const grades = await db.UsersGradeModel.find({
        _id: { $in: defaultRoleGradesId },
      });
      defaultRoleGradesId = grades.map((g) => g._id);
      await db.SettingModel.updateOne(
        { _id: 'topping' },
        {
          $set: {
            'c.rolesId': rolesId,
            'c.defaultRoleGradesId': defaultRoleGradesId,
          },
        },
      );
      await db.SettingModel.saveSettingsToRedis('topping');
      await next();
    },
  );
module.exports = router;
