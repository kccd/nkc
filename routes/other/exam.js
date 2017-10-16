const Router = require('koa-router');
const examRouter = new Router();
examRouter
  .get('/', async (ctx, next) => {
    ctx.body = '选择考试科目页面';
    next();
  })
  .get('/:type', async (ctx, next) => {
    const type = ctx.params.type;
    let data = await ctx.db.questionModel.find({type: type}).limit(10);
    ctx.body = JSON.stringify(data);
    next();
  })
  .post('/', async (ctx, next) => {
    ctx.body = '提交试卷';
    next();
  })
  .get('/viewQuestion', async (ctx, next) => {
    ctx.body = '添加试题页面';
    next();
  })
  .post('/viewQuestion', async (ctx, next) => {
    ctx.body = '提交添加的试题';
    next();
  })
  .del('/viewQuestion', async (ctx, next) =>{
    ctx.body = '删除某题';
    next();
  })
  .put('/viewQuestion', async (ctx, next) => {
    ctx.body = '修改某题';
    next();
  });

module.exports = examRouter;