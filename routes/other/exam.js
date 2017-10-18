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
    const ip = ctx.ip;
    let numberOfSubject = settings.exam.numberOfSubject;
    let numberOfCommon = settings.exam.numberOfCommon;
    if(category === 'mix') {
      numberOfSubject = settings.exam.numberOfSubjectA;
      numberOfCommon = settings.exam.numberOfCommonA;
    }
    let commonCount = await ctx.db.QuestionModel.count({category: 'common'});
    let subjectCount = await ctx.db.QuestionModel.count({category: category});
    if(subjectCount == 0) {
      throw `科目 “${category}” 不存在，请选择正确的考试科目。`;
    }
    let questions = [];
    let arrOfDifferentValue = (arrValueCount, max) => {
      // 题库中该科目的总数必须满足不小于需要的题目数量
      if(arrValueCount > max) {
        throw `该科目题目数量太少，根本不能组成一套试卷，请更换科目。`;
      }
      let skipArr = [];
      let random = (num) => {
        return Math.round(Math.random()*(num-1));
      };
      for (let i = 0; i < arrValueCount; i++) {
        let repeat = true;
        while(repeat){
          let num = random(max);
          let equal = false;
          if(skipArr.indexOf(num) < 0) {
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
  //获得激活码
  .post('/subject', async (ctx, next) => {
    ctx.data.result = 'asdfasdfasdf';
    ctx.template = 'interface_exam.pug';
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