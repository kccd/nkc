const Router = require('koa-router');
const examRouter = new Router();
examRouter
  .get('/', async (ctx, next) => {
    ctx.body = '选择考试科目页面';
    next();
  })
  .get('/:type', async (ctx, next) => {
    const type = ctx.params.type;
    ctx.body = `试卷页面， 试卷类型 ${type}`;
    next();
  })
  .post('/', async (ctx, next) => {
    ctx.body = '提交试卷';
    next();
  })

module.exports = examRouter;