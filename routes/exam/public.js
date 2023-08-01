const Router = require('koa-router');
const publicRouter = new Router();
publicRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'exam/public.pug';
    await next();
  })
  .get('/takeExam', async (ctx, next) => {
    ctx.template = 'exam/takeExam.pug';
    await next();
  });
module.exports = publicRouter;
