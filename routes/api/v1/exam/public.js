const { OnlyPermission } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const randomize = require('randomatic');
const router = require('koa-router')();
router
  .get('/', OnlyPermission(Operations.visitPublicExam), async (ctx, next) => {
    const { db } = ctx;
    const {
      c: { publicExamNotes },
    } = await db.SettingModel.findOnly({ _id: 'exam' }, { c: 1 });
    ctx.apiData = { publicExamNotes };
    await next();
  })
  .get(
    '/register',
    OnlyPermission(Operations.visitPublicExam),
    async (ctx, next) => {
      const { db } = ctx;
      const {
        c: { registerExamination },
      } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
      ctx.apiData = {
        registerExamination,
      };
      await next();
    },
  )
  .get(
    '/takeExam',
    OnlyPermission(Operations.visitPublicExam),
    async (ctx, next) => {
      const { db } = ctx;
      const {
        c: { examSource },
      } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
      ctx.apiData = {
        examSource,
      };
      await next();
    },
  )
  .post(
    '/submitExam',
    OnlyPermission(Operations.visitPublicExam),
    async (ctx, next) => {
      //设置密钥
      const randomize1 = randomize('A0', 64);
      // 设置token有效期

      ctx.apiData = {
        success: '成功了',
      };
      await next();
    },
  );

module.exports = router;
