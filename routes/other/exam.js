const Router = require('koa-router');
const cookieSignature = require('cookie-signature');
const settings = require('../../settings');
const examRouter = new Router();
examRouter
  //选择考试科目页面
  .get('/subject', async (ctx, next) => {
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
    if(subjectCount === 0) {
      throw `科目 “${category}” 不存在，请选择正确的考试科目。`;
    }
    let questions = [];

    // 生成指定元素数量的数组，且数组元素不重复
    let arrOfDifferentValue = (arrValueCount, max) => {
      // 题库中该科目的总数必须满足不小于需要的题目数量,否则会陷入死循环
      if(arrValueCount > max) {
        throw `该科目下题的数量太少了，无法构成一张试卷，请更换考试科目。`;
        //arrValueCount = max;
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

    //数组元素位置随机交换
    let exchangeIndex = (arr) => {
      let arrCount = arr.length;
      let arrCopy = [];
      let arrIndex = arrOfDifferentValue(arrCount, arrCount);
      for(let j = 0; j < arrIndex.length; j++) {
        arrCopy[j] = arr[arrIndex[j]];
      }
      return arrCopy;
    };

    //判断答案类型
    let exchangeAnswer = (question) => {
      let outQustion = {
        question: question.question,
        type: question.type,
        qid: question.qid,
      };
      if(question.type === 'ch4') {
        //交换答案顺序
        outQustion.choices = exchangeIndex(question.answer);
      }
      return outQustion;
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
    //交换题目顺序
    questions = exchangeIndex(questions);
    let exam = {};
    exam.toc = Date.now();
    exam.qarr = questions;
    let signature = '';
    for (let i = 0; i < questions.length; i++) {
      signature += questions[i].qid;
    }
    signature += exam.toc.toString();
    signature = cookieSignature.sign(signature,settings.cookie.secret);
    exam.signature = signature;
    ctx.data.exam = exam;
    ctx.data.category = category;
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