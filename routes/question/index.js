const Router = require('koa-router');
const questionRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;

questionRouter
  .get('/', async (ctx, next) => {
    const {data} = ctx;
    const {user} = data;
    if(!user) ctx.throw(401, '你还没有登陆，请登录后再试。');
    data.questions = await dbFn.getQuestionsByQuery();
    data.userQuestions = await dbFn.getQuestionsByQuery({uid: user.uid});
    data.numberByCategory = await dbFn.questionCountOfCategory();
    data.numberByUser = await dbFn.questionCountOfUser();
    ctx.template = 'questions_edit.pug';
    await next();
  })
  .get('/:category', async (ctx, next) => {
    const {data, db} = ctx;
    const user = data.user;
    const {category} = ctx.params;
    if(!user) ctx.throw(401, '你还没有登陆，请登录后再试。');
    data.questions = await dbFn.getQuestionsByQuery({category: category});
    data.userQuestions = await dbFn.getQuestionsByQuery({uid: user.uid});
    data.numberByCategory = await dbFn.questionCountOfCategory();
    data.numberByUser = await dbFn.questionCountOfUser();
    ctx.template = 'questions_edit.pug';
    await next();
  })
  .post('/:category', async (ctx, next) => {
    const params = ctx.body;
    const {data, db} = ctx;
    const user = data.user;
    const qid = await db.SettingModel.operateSystemID('questions', 1);
    const question = new db.QuestionModel({
      uid: user.uid,
      username: user.username,
      question: params.question,
      answer: params.answer,
      type: params.type,
      category: params.category,
      tlm: Date.now(),
      qid: qid
    });
    try{
      await question.save();
    }catch(err) {
      await db.SettingModel.operateSystemID('questions', -1);
      ctx.throw(500, `添加考试题失败！ ${err}`);
    }
    await next();
  })
  .patch('/:category/:qid', async (ctx, next) => {
    const {db, data} = ctx;
    const {qid} = ctx.params;
    const params = ctx.body;
    const question = {
      question: params.question,
      answer: params.answer,
      type: params.type,
      category: params.category,
      tlm: Date.now()
    };
    const targetQuestion = await db.QuestionModel.findOnly({qid});
    await targetQuestion.update(question);
    data.targetUser = await targetQuestion.extendUser();
    await next();
  })
  .get('/:category/:qid', async (ctx, next) => {
    const {qid} = ctx.params;
    const {data, db} = ctx;
    const targetQuestion = await db.QuestionModel.findOnly({qid});
    data.question = targetQuestion;
    data.targetUser = await targetQuestion.extendUser();
    await next();
  })
  .del('/:category/:qid', async (ctx, next) => {
    const qid = ctx.params.qid;
    const {db, data} = ctx;
    const targetQuestion = await db.QuestionModel.findOnly({qid});
    await targetQuestion.remove();
    data.targetUser = await targetQuestion.extendUser();
    await next();
  });


module.exports = questionRouter;
