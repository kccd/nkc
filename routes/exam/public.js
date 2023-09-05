const Router = require('koa-router');
const { paperService } = require('../../services/exam/paper.service');
const publicRouter = new Router();
publicRouter.get('/takeExam/:pid', async (ctx, next) => {
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
