const {
  OnlyPermission,
  OnlyVisitor,
} = require('../../../../middlewares/permission');
const { FixedOperations } = require('../../../../settings/operations');
const randomize = require('randomatic');
const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const { db } = ctx;
    const { publicExamNotes } = await db.SettingModel.getSettings('exam');
    ctx.apiData = { publicExamNotes };
    await next();
  })
  .get('/register', OnlyVisitor(), async (ctx, next) => {
    const { db } = ctx;
    const {
      c: { registerExamination },
    } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
    ctx.apiData = {
      registerExamination,
    };
    await next();
  })
  .get(
    '/paper',
    OnlyPermission(FixedOperations.visitPublicExam),
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
    '/result',
    OnlyPermission(FixedOperations.visitPublicExam),
    async (ctx, next) => {
      const randomize1 = randomize('A0', 64);
      ctx.apiData = {
        success: '成功了',
      };
      await next();
    },
  );

module.exports = router;
