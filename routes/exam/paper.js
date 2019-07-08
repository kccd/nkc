const Router = require('koa-router');
const paperRouter = new Router();
paperRouter
  .get('/', async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    let {cid} = query;
    cid = Number(cid);
    const category = await db.ExamsCategoryModel.findOnly({_id: cid});
    if(category.disabled) ctx.throw(403, '该科目的下的考试已被屏蔽，请刷新');
    const {user} = data;
    const timeLimit = 45*60*1000;
    let qidArr = [];
    let questionCount = 0;
    // 该考卷下有未完成的考试
    let paper = await db.ExamsPaperModel.findOne({uid: user.uid, cid, submitted: false, timeOut: false});
    if(paper) {
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/exam/paper/${paper._id}?created=true`));
    }
    // 限制条件
    const examSettings = await db.SettingModel.findOnly({_id: 'exam'});
    const {count, countOneDay, waitingTime} = examSettings.c;
    const paperCount = await db.ExamsPaperModel.count({uid: user.uid, toc: {$gte: nkcModules.apiFunction.today()}});
    if(paperCount >= countOneDay) ctx.throw(403, `一天之内只能参加${countOneDay}次考试，今日您的考试次数已用完，请明天再试。`);
    const now = Date.now();
    let {stageTime} = user.generalSettings.examSettings;
    // const allPaperCount = await db.ExamsPaperModel.count({uid: user.uid, toc: {$gte: waitingTime*24*60*60*1000}});
    const allPaperCount = await db.ExamsPaperModel.count({uid: user.uid, toc: {$gte: stageTime}});
    stageTime = new Date(stageTime).getTime();
    if(allPaperCount >= count) {
      if(now > stageTime + waitingTime*24*60*60*1000) {
        await user.generalSettings.update({'examSettings.stageTime': now});
      } else {
        ctx.throw(403, `您观看考题数量过多或考试次数达到${count}次，需等待${waitingTime}天后才能再次参加考试，请于${new Date(stageTime + waitingTime*24*60*60*1000).toLocaleString()}之后再试。`);
      }
    }
    // 45分钟之内进入相同的考卷
    const {passScore, time} = category;
    paper = await db.ExamsPaperModel.findOne({uid: user.uid, cid, toc: {$gte: Date.now() - timeLimit}}).sort({toc: -1});
    if(paper) {
      const record = paper.record.map(r => {
        return {
          qid: r.qid
        }
      });
      // 随机交换数组元素位置
      nkcModules.apiFunction.shuffle(record);
      qidArr = record.map(r => r.qid);
    } else {
      // 加载不同考卷的题目
      const {from, volume} = category;
      for(const f of from) {
        const {count, type, fid} = f;
        questionCount += count;
        if(type === 'pub') {
          // 需要从公共题库抽取题目，先从45分钟以内出现过的公共题中抽取
          // 获取用户45分钟以内的考卷
          const latestPapers = await db.ExamsPaperModel.find({uid: user.uid, toc: {$gte: Date.now() - timeLimit}}).sort({toc: -1});
          // 获取该用户45分钟以内的所有公共题ID
          const oldQidArr = new Set();
          latestPapers.map(p => {
            p.record.map(r => {
              oldQidArr.add(r.qid);
            });
          });
          const oldPubQuestions = await db.QuestionModel.find({_id: {$in: [...oldQidArr]}, public: true, volume});
          const oldPubId = oldPubQuestions.map(q => q._id);
          if(count <= oldPubId.length) {
            // 45分钟之内出现的公共题数量足够
            qidArr = qidArr.concat(oldPubId.slice(0, count));
          } else {
            // 45分钟之内出现的公共题数量不足，超出的部分去题库里面抽取
            qidArr = qidArr.concat(oldPubId);
            const questions = await db.QuestionModel.aggregate([
              {
                $match: {
                  _id: {$nin: oldPubId},
                  volume,
                  public: true,
                  auth: true,
                  disabled: false
                }
              },
              {
                $sample: {
                  size: count - oldPubId.length
                }
              }
            ]);
            if(questions.length < count - oldPubId.length) ctx.throw(400, '公共题库试题数量不足');
            questions.map(q => {
              qidArr.push(q._id);
            });
          }
        } else {
          const questions = await db.QuestionModel.aggregate([
            {
              $match: {
                fid,
                volume,
                public: false,
                auth: true,
                disabled: false
              }
            },
            {
              $sample: {
                size: count
              }
            }
          ]);
          if(questions.length < count) {
            const forum = await db.ForumModel.findOnly({fid});
            ctx.throw(400, `${forum.displayName} 题库试题数量不足`);
          }
          questions.map(q => {
            qidArr.push(q._id);
          }); 
        }
      }
    }
    const questions = await db.QuestionModel.find({_id: {$in: qidArr}});
    if(questions.length < questionCount) ctx.throw(400, '当前科目的题库试题不足，请选择其他科目参加考试。');
    nkcModules.apiFunction.shuffle(questions);

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
    paper = db.ExamsPaperModel({
      _id: await db.SettingModel.operateSystemID('examsPapers', 1),
      uid: user.uid,
      cid,
      ip: ctx.address,
      record: papersQuestions,
      passScore,
      time
    });
    await paper.save();
    // 跳转到考试页面
    return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/exam/paper/${paper._id}`));
  })
  .get('/:_id', async (ctx, next) => {
    const {db, data, params, query, nkcModules} = ctx;
    const {created} = query;
    if(created === 'true') data.created = true;
    const {user} = data;
    const {_id} = params;
    const paper = await db.ExamsPaperModel.findOnly({_id, uid: user.uid});
    if(paper.timeOut) ctx.throw(403, '考试已结束');
    if(paper.submitted) ctx.throw(403, '考试已结束');
    const category = await db.ExamsCategoryModel.findOnly({_id: paper.cid});
    if(category.disabled) ctx.throw(403, '考试所在的科目已被屏蔽');
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
      category: category,
      _id: paper._id
    };
    data.category = category;
    data.examSettings = (await db.SettingModel.findOnly({_id: 'exam'})).c;
    data.countToday = await db.ExamsPaperModel.count({uid: user.uid, toc: {$gte: nkcModules.apiFunction.today()}});
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
    if(category.disabled) {
      ctx.throw(403, `该科目下的考试已被屏蔽`);
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
      record[i].answer = questions[i].answer;
    }
    q.record = record;
    q.score = score;
    q.passed = paper.passScore <= q.score;
    q.submitted = true;
    q.tlm = Date.now();
    if(q.passed) {
      const userObj = {};
      userObj[`volume${category.volume}`] = true;
      if(category.volume === 'B') {
        userObj.volumeA = true;
      }
      await user.update(userObj);
      for(const id of category.rolesId) {
        if(id) await user.update({$addToSet: {certs: id}});
      }
    }
    await paper.update(q);
    data.passed = q.passed;
    await next();
  });
module.exports = paperRouter;