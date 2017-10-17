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
    let commonCount = await ctx.db.QuestionModel.count({category: 'common'});
    let subjectCount = await ctx.db.QuestionModel.count({category: category});
    let questions = [];
    let arrOfDifferentValue = (arrValueCount, max) => {
      let skipArr = [];
      let random = (num) => {
        return Math.round(Math.random()*(num-1));
      };
      for (let i = 0; i < arrValueCount; i++) {
        let repeat = true;
        while(repeat){
          let num = random(max);
          let equal = false;
          for (let j = 0; j < skipArr.length; j++) {
            if(skipArr[j] === num) {
              equal = true;
            }
          }
          if(!equal) {
            repeat = false;
            skipArr.push(num);
          }
        }
      }
      return skipArr;
    };
    let exchangeAnswer = (question) => {
      if(question.type !== 'ch4') {
        return {
          question: question.question,
          type: question.type,
          qid: question.qid
        }
      }
      return {
        question: question.question,
        choices: question.answer,
        type: question.type,
        qid: question.qid
      }
    };
    let skipArrOfCommon = arrOfDifferentValue(numberOfCommon, commonCount);
    let skipArrOfSubject = arrOfDifferentValue(numberOfSubject, subjectCount);
    for (let i = 0; i < skipArrOfCommon.length; i++) {
      let question = await ctx.db.QuestionModel.findOne({category: 'common'}).skip(skipArrOfCommon[i]);
      questions.push(exchangeAnswer(question));
    }
    for (let i = 0; i < skipArrOfSubject.length; i++) {
      let question = await ctx.db.QuestionModel.findOne({category: category}).skip(skipArrOfSubject[i]);
      questions.push(exchangeAnswer(question));
    }
    let exam = {};
    exam.qarr = questions;
    ctx.data.exam = exam;
    ctx.template = 'interface_exam.pug';
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