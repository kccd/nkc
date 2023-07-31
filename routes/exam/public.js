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
    console.log('takeExam');
  });
module.exports = publicRouter;
