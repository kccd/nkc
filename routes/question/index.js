const Router = require('koa-router');
const questionRouter = new Router();
// 通过uid和category查询
let findQuestion = async (db, uidObj, categoryObj) => {
  let questions = await db.QuestionModel.find().and([uidObj, categoryObj]).sort({toc:-1});
  if(!uidObj) {
    for(let question of questions) {
      question.user = await ctx.db.UserModel.findOne({uid: question.uid});
    }
  }
  return questions;
};
// 默认数据
let defaultData = async (db) => {
  let data = {};
  data.numberByCategory = await db.QuestionModel.aggregate([
    {$group: {_id: '$category', number: {$sum: 1}}},
    {$sort: {number: -1}},
    {$project: {_id: 0, category: '$_id', number: 1}}
  ]);
  data.numberByUser = await db.QuestionModel.aggregate([
    {$group: {_id: '$username', number: {$sum: 1}}},
    {$sort:{number: -1}},
    {$project: {_id: 0, username: '$_id', number: 1}},
  ]);
  return data;
};

questionRouter
  .get('/category', async (ctx, next) => {
    let user = ctx.data.user;
    ctx.data.questions = await findQuestion(ctx.db, {}, {});
    ctx.data.userQuestions = await findQuestion(ctx.db, {uid: user.uid}, {});
    let defaultDate = await defaultData(ctx.db);
    ctx.data.numberByCategory = defaultDate.numberByCategory;
    ctx.data.numberByUser = defaultDate.numberByUser;
    ctx.template = 'questions_edit.pug';
  })
  .get('/category/:category', async (ctx, next) => {
    let user = ctx.data.user;
    let category = ctx.params.category;
    ctx.data.questions = await findQuestion(ctx.db, {}, {category: category});
    ctx.data.userQuestions = await findQuestion(ctx.db, {uid: user.uid}, {});
    let defaultDate = await defaultData(ctx.db);
    ctx.data.numberByCategory = defaultDate.numberByCategory;
    ctx.data.numberByUser = defaultDate.numberByUser;
    ctx.template = 'questions_edit.pug';
  });


module.exports = questionRouter;