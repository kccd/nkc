const Router = require('koa-router');
const paperRouter = new Router();
paperRouter
  .get('/', async (ctx, next) => {
    const {db, data, query} = ctx;
    let {cid, volume} = query;
    cid = Number(cid);
    const {user} = data;
    const oldPaper = await db.ExamsPaperModel.findOne({uid: user.uid, submitted: false, timeOut: false, violation: false});
    const category = await db.ExamsCategoryModel.findOnly({_id: cid});
    if(oldPaper) {
      // 判断试卷是否超时
      if((Date.now() - oldPaper.toc)/(1000*60) > category[`paper${oldPaper.volume}Time`]) {
        await oldPaper.update({timeOut: true});
      } else {
        return ctx.redirect(`/exam/paper/${oldPaper._id}`);
      }
    }
    if(!['A', 'B'].includes(volume)) ctx.throw(400, `参数错误：volume=${volume}`);
    if((volume === 'A' && category.disabledA) || (volume === 'B' && category.disabledB)) {
      ctx.throw(400, `该科目下的${volume}卷考试已被关闭`);
    }
    let paperQuestionCount;
    if(volume === 'A') {
      paperQuestionCount = category.paperAQuestionsCount;
    } else {
      paperQuestionCount = category.paperBQuestionsCount;
    }
    const count = await db.QuestionModel.count({cid, volume, auth: true, disabled: false});
    if(count < paperQuestionCount) ctx.throw(400, `${category.name}${volume}卷试题数量不足`);
    let questions = await db.QuestionModel.aggregate([
      {
        $match: {
          cid,
          volume,
          auth: true,
          disabled: false
        }
      },
      {
        $sample: {
          size: category[`paper${volume}QuestionsCount`]
        }
      }
    ]);
    const papersQuestions = [];
    await Promise.all(questions.map(async q => {
      if(q.type === 'ch4') {
        const results = [];
        while(results.length < 4) {
          const num = Math.round(Math.random()*3);
          if(!results.includes(num)) results.push(num);
        }
        papersQuestions.push({
          qid: q._id,
          answerIndex: results,
        });
      } else {
        papersQuestions.push({
          qid: q._id
        });
      }
    }));
    const paper = db.ExamsPaperModel({
      _id: await db.SettingModel.operateSystemID('examsPapers', 1),
      uid: user.uid,
      volume,
      cid,
      record: papersQuestions,
      passScore: category[`paper${volume}PassScore`]
    });
    await paper.save();
    return ctx.redirect(`/exam/paper/${paper._id}`);
  })
  .get('/:_id', async (ctx, next) => {
    const {db, data, params} = ctx;
    const {user} = data;
    const {_id} = params;
    const paper = await db.ExamsPaperModel.findOnly({_id, uid: user.uid});
    if(paper.timeOut) ctx.throw(403, '考试已结束');
    if(paper.submitted) ctx.throw(403, '考试已结束');
    const category = await db.ExamsCategoryModel.findOnly({_id: paper.cid});
    if((Date.now() - paper.toc)/(1000*60) > category[`paper${paper.volume}Time`]) {
      await paper.update({timeOut: true});
      ctx.throw(403, '考试已结束');
    }
    const questions = [];
    const {record} = paper;
    for(const r of record) {
      const question = await db.QuestionModel.findOnly({_id: r.qid});
      const ans = [];
      if(question.type === 'ch4') {
        for(const n of r.answerIndex) {
          ans.push(question.answer[n]);
        }
      }
      questions.push({
        _id: question._id,
        type: question.type,
        content: question.content,
        ans,
        hasImage: question.hasImage
      });
    }
    data.questions = questions;
    data.paper = {
      toc: paper.toc,
      volume: paper.volume,
      category: category,
      _id: paper._id
    };
    data.category = category;
    ctx.template = 'exam/paper.pug';
    await next();
  })
  .post('/:_id', async (ctx, next) => {
    const {params, db, data, body} = ctx;
    const {user} = data;
    const {_id} = params;
    const paper = await db.ExamsPaperModel.findOnly({_id: Number(_id), uid: user.uid});
    if(paper.timeOut) ctx.throw(403, '考试已结束');
    if(paper.submitted) ctx.throw(403, '考试已结束');
    const category = await db.ExamsCategoryModel.findOnly({_id: paper.cid});
    if(category[`disabled${paper.volume}`]) {
      await paper.update({submitted: true});
      ctx.throw(403, `该科目下的${paper.volume}卷考试已被关闭`);
    }
    const qid = paper.record.map(r => r.qid);
    const questionsDB = await db.QuestionModel.find({_id: {$in : qid}});
    const questionObj = {};
    for(const q of questionsDB) {
      questionObj[q._id] = q;
    }
    const {questions} = body;
    const {record} = paper;
    let score = 0;
    const q = {};
    for(let i = 0; i < record.length; i++) {
      const r = record[i];
      if(r.qid !== questions[i]._id) ctx.throw(400, '试卷题目顺序有误，本次考试无效，请重新考试。');
      const question = questionObj[r.qid];
      r.correct = false;
      if(question.type === 'ch4') {
        for(let j = 0; j < r.answerIndex.length; j ++) {
          const index = r.answerIndex[j];
          if(question.answer[index] !== questions[i].ans[j]) ctx.throw(400, '试卷题目答案顺序有误，本次考试无效，请重新考试。');
          if(index === 0 && questions[i].answer === j) {
            r.correct = true;
            score ++;
          }
        }
      } else {
        if(question.answer[0] === questions[i].answer) {
          r.correct = true;
          score ++;
        }
      }
      record.answer = questions[i].answer;
    }
    q.record = record;
    q.score = score;
    q.passed = paper.passScore <= q.score;
    q.submitted = true;
    if(q.passed) {
      const userObj = {};
      userObj[`volume${paper.volume}`] = true;
      if(paper.volume === 'B') {
        userObj.volumeA = true;
      }
      const passingCert = category[`passing${paper.volume}Cert`];
      if(passingCert || !user.certs.includes(passingCert)) {
        userObj.$addToSet = {certs: passingCert};
      }
      await user.update(userObj);
    }
    await paper.update(q);
    data.passed = q.passed;
    await next();
  });
module.exports = paperRouter;