const Router = require('koa-router');
const questionRouter = new Router();
questionRouter
  .get('/', async (ctx, next) => {
    let user = ctx.data.user;
    let questions = await ctx.db.QuestionModel.find().sort({toc:-1});
    for(let question of questions) {
      question.user = await ctx.db.UserModel.findOne({uid: question.uid});
    }
    let userQuestions = await ctx.db.QuestionModel.find({uid: user.uid}).sort({toc: -1});
    let questionNumberByUser = await ctx.db.QuestionModel.aggregate([
      {$group: {_id: '$username', number: {$sum: 1}}},
      {$sort:{number: -1}},
      {$project: {_id: 0, username: '$_id', number: 1}},
    ]);
    let questionNumberByCategory = await ctx.db.QuestionModel.aggregate([
      {$group: {_id: '$category', number: {$sum: 1}}},
      {$sort: {number: -1}},
      {$project: {_id: 0, category: '$_id', number: 1}}
    ]);
    console.log(questionNumberByCategory);
    ctx.data.questionNumberByCategory = questionNumberByCategory;
    ctx.data.questionNumberByUser = questionNumberByUser;
    ctx.data.questions = questions;
    ctx.data.userQuestions = userQuestions;
    ctx.template = 'questions_edit.pug';
  });

module.exports = questionRouter;