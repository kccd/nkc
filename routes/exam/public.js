const Router = require('koa-router');
const publicRouter = new Router();
publicRouter
  .get('/', async (ctx, next) => {
    const { db, data } = ctx;
    ctx.template = 'exam/public.pug';
    data.publicExamNotes = (
      await db.SettingModel.findOnly({ _id: 'exam' })
    ).c.publicExamNotes;
    await next();
  })
  .get('/register', async (ctx, next) => {
    const { db, data } = ctx;
    const {
      c: { registerExamination },
    } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
    data.registerExamination = registerExamination;
    await next();
  })
  .get('/takeExam', async (ctx, next) => {
    const { db, data } = ctx;
    ctx.template = 'exam/takeExam.pug';
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
      console.log(from, 'from');
    }, []);
    // data.examSource = examSource;
    await next();
  });
module.exports = publicRouter;
