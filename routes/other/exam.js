const Router = require('koa-router');
const settings = require('../../settings');
const examRouter = new Router();
examRouter
  //选择考试科目页面
  .get('/', async (ctx, next) => {
    ctx.data.getcode = true;
    ctx.template = 'interface_user_register.pug';
    next();
  })
  //答题界面
  .get('/subject/:category', async (ctx, next) => {
    const category = ctx.params.category;
    let numberOfSubject = settings.exam.numberOfSubject;
    let numberOfCommon = settings.exam.numberOfCommon;
    if(category === 'mix') {
      numberOfSubject = settings.exam.numberOfSubjectA;
      numberOfCommon = settings.exam.numberOfCommonA;
    }
    
    let data = await ctx.db.QuestionModel.find({category: 'mix'}).limit(10);
    ctx.data = JSON.stringify(data);
    ctx.template = 'user.pug';
    next();
  })
  .post('/subject', async (ctx, next) => {
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