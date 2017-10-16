const Router = require('koa-router');
const examRouter = new Router();
examRouter
  .get('/', async (ctx, next) => {
    ctx.data = '选择考试科目页面';
    next();
  })
  .get('/:category', async (ctx, next) => {
    const category = ctx.params.category;
    let data = await ctx.db.questionModel.find({category: 'mix'}).limit(10);
    ctx.data = JSON.stringify(data);
    ctx.template = 'user.pug';
    next();
  })
  .post('/', async (ctx, next) => {
    ctx.data = '提交试卷';
    next();
  })
  .get('/viewQuestion', async (ctx, next) => {
    ctx.data = '添加试题页面';
    next();
  })
  .post('/viewQuestion', async (ctx, next) => {
    ctx.data = '提交添加的试题';
    next();
  })
  .del('/viewQuestion', async (ctx, next) =>{
    ctx.data = '删除某题';
    next();
  })
  .put('/viewQuestion', async (ctx, next) => {
    ctx.data = '修改某题';
    next();
  });

module.exports = examRouter;