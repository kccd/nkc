const Router = require('koa-router');
const { paperService } = require('../../services/exam/paper.service');
const publicRouter = new Router();
publicRouter
  .get('/', async (ctx, next) => {
    const { db, data } = ctx;
    //获取注册需要考哪些卷子
    const {
      c: { examSource },
    } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
    const { publicExamNotes } = await db.SettingModel.getSettings('exam');
    data.examSource = examSource;
    data.publicExamNotes = publicExamNotes;
    ctx.template = 'exam/public.pug';
    await next();
  })
  .get('/takeExam/:pid', async (ctx, next) => {
    const {
      params: { pid },
      data,
    } = ctx;
    const ip = ctx.address;
    await paperService.checkPaperLegal(pid, ip);
    data.pid = pid;
    ctx.template = 'exam/takeExam.pug';
    await next();
  });
module.exports = publicRouter;
