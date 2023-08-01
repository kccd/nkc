const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const { db } = ctx;
    const {
      c: { publicExamNotes },
    } = await db.SettingModel.findOnly({ _id: 'exam' }, { c: 1 });
    ctx.apiData = { publicExamNotes };
    await next();
  })
  .get('/register', async (ctx, next) => {
    const { db } = ctx;
    const {
      c: { registerExamination },
    } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
    ctx.apiData = {
      registerExamination,
    };
    await next();
  })
  .get('/takeExam', async (ctx, next) => {
    const { db } = ctx;
    const {
      c: { examSource },
    } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
    const categoriseId = examSource.map((item) => {
      return item._id;
    });
    const examCategoryType = await db.ExamsCategoryModel.getExamCategoryType();
    const categorise = await db.ExamsCategoryModel.find(
      {
        _id: { $in: categoriseId },
        type: examCategoryType.public,
        disabled: false,
      },
      { volume: 1, from: 1 },
    ).lean();
    categorise.reduce((acc, cur) => {
      const { from, ...resParma } = cur;
    }, []);
    ctx.apiData = {
      examSource,
    };
    await next();
  });
module.exports = router;
