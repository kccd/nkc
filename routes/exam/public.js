const Router = require('koa-router');
const { paperService } = require('../../services/exam/paper.service');
const { Public } = require('../../middlewares/permission');
const publicRouter = new Router();
publicRouter.get('/public-paper/:pid', Public(), async (ctx, next) => {
  const {
    params: { pid },
    data,
    state: { uid },
  } = ctx;
  const ip = ctx.address;
  await paperService.checkPaperLegal(pid, ip, uid);
  data.pid = pid;
  ctx.template = 'exam/publicPaper.pug';
  await next();
});
module.exports = publicRouter;
