const Router = require('koa-router');
const { questionService } = require('../../services/exam/question.service');
const paperRouter = new Router();
paperRouter
  .get('/', async (ctx, next) => {
    const { db, query, nkcModules, state } = ctx;
    let { cid } = query;
    cid = Number(cid);
    const category = await db.ExamsCategoryModel.findOnly({ _id: cid });
    if (category.disabled) {
      ctx.throw(403, '该科目的下的考试已被屏蔽，请刷新');
    }
    const { uid } = state;

    const timeLimit = 45 * 60 * 1000;
    let questionCount = 0;
    // 该考卷下有未完成的考试
    // let paper = await db.ExamsPaperModel.findOne({
    //   uid: uid,
    //   cid,
    //   submitted: false,
    //   timeOut: false,
    // });
    // if (paper) {
    //   return ctx.redirect(`/exam/paper/${paper._id}?created=true`);
    // }
    // 限制条件
    const examSettings = await db.SettingModel.findOnly({ _id: 'exam' });
    const { count, countOneDay, waitingTime } = examSettings.c;
    const paperCount = await db.ExamsPaperModel.countDocuments({
      uid,
      toc: { $gte: nkcModules.apiFunction.today() },
    });
    if (paperCount >= countOneDay) {
      ctx.throw(
        403,
        `一天之内只能参加${countOneDay}次考试，今日您的考试次数已用完，请明天再试。`,
      );
    }
    const now = Date.now();
    const generalSettings = await db.UsersGeneralModel.findOne({
      uid,
    });
    let { stageTime } = generalSettings.examSettings;
    // const allPaperCount = await db.ExamsPaperModel.countDocuments({uid: uid, toc: {$gte: waitingTime*24*60*60*1000}});
    const allPaperCount = await db.ExamsPaperModel.countDocuments({
      uid,
      toc: { $gte: stageTime },
    });
    stageTime = new Date(stageTime).getTime();
    if (allPaperCount >= count) {
      if (now > stageTime + waitingTime * 24 * 60 * 60 * 1000) {
        await generalSettings.updateOne({ 'examSettings.stageTime': now });
      } else {
        ctx.throw(
          403,
          `您观看考题数量过多或考试次数达到${count}次，需等待${waitingTime}天后才能再次参加考试，请于${new Date(
            stageTime + waitingTime * 24 * 60 * 60 * 1000,
          ).toLocaleString()}之后再试。`,
        );
      }
    }
    // 45分钟之内进入相同的考卷
    const { passScore, time } = category;
    paper = await db.ExamsPaperModel.findOne({
      uid,
      cid,
      toc: { $gte: Date.now() - timeLimit },
    }).sort({ toc: -1 });
    // if (paper) {
    //   const record = paper.record.map((r) => {
    //     return {
    //       qid: r.qid,
    //     };
    //   });
    //   // 随机交换数组元素位置
    //   nkcModules.apiFunction.shuffle(record);
    //   qidArr = record.map((r) => r.qid);
    // } else {
    // 加载不同考卷的题目
    const { from, volume } = category;
    const condition = {
      volume,
      auth: true,
      disabled: false,
    };
    //检测试题是否满足数量
    await questionService.canTakeQuestionNumbers(from, condition);
    const questions = [];
    const questionsId = [];
    for (const f of from) {
      const { count, tag } = f;
      const conditionQ = {
        ...condition,
        tags: { $in: [tag] },
        _id: { $ne: questionsId },
      };
      const selectedQuestions = await db.QuestionModel.aggregate([
        {
          $match: conditionQ,
        },
        {
          $sample: { size: count }, // 选择指定数量的随机题目
        },
        {
          $project: { _id: 1, type: 1, content: 1, answer: 1 },
        },
      ]);
      selectedQuestions.forEach((item) => {
        const { _id, type, content, answer } = item;
        questions.push({ qid: _id, type, content, answer });
        questionsId.push(item._id);
      });
      questionCount += count;
    }
    if (questions.length < questionCount) {
      ctx.throw(400, '当前科目的题库试题不足，请选择其他科目参加考试。');
    }
    //保证题目的随机性
    nkcModules.apiFunction.shuffle(questions);
    questions.forEach((item) => {
      nkcModules.apiFunction.shuffle(item.answer);
    });
    paper = db.ExamsPaperModel({
      _id: await db.SettingModel.operateSystemID('examsPapers', 1),
      uid,
      cid,
      ip: ctx.address,
      record: questions,
      passScore,
      time,
    });
    await paper.save();
    // 跳转到考试页面
    return ctx.redirect(`/exam/paper/${paper._id}`);
  })
  .get('/:_id', async (ctx, next) => {
    const { db, data, params, query, nkcModules, state } = ctx;
    const { created } = query;
    if (created === 'true') {
      data.created = true;
    }
    const { uid } = state;
    const { _id } = params;
    const paper = await db.ExamsPaperModel.findOnly({ _id, uid });
    if (paper.timeOut) {
      ctx.throw(403, '考试已结束');
    }
    if (paper.submitted) {
      ctx.throw(403, '考试已结束');
    }
    const category = await db.ExamsCategoryModel.findOnly({ _id: paper.cid });
    if (category.disabled) {
      ctx.throw(403, '考试所在的科目已被屏蔽');
    }
    const questions = [];
    const { record } = paper;
    for (const r of record) {
      const { hasImage } = await db.QuestionModel.findOnly({ _id: r.qid });
      const { qid, type, content, answer } = r;
      questions.push({
        qid,
        type,
        content,
        answer,
        hasImage,
      });
    }
    data.questions = questions;
    data.paper = {
      toc: paper.toc,
      category: category,
      _id: paper._id,
    };
    data.category = category;
    data.examSettings = (await db.SettingModel.findOnly({ _id: 'exam' })).c;
    data.countToday = await db.ExamsPaperModel.countDocuments({
      uid: uid,
      toc: { $gte: nkcModules.apiFunction.today() },
    });
    ctx.template = 'exam/paper.pug';
    await next();
  })
  .post('/:_id', async (ctx, next) => {
    const { params, db, data, body, state } = ctx;
    const { uid } = state;
    const { _id } = params;
    const paper = await db.ExamsPaperModel.findOnly({
      _id: Number(_id),
      uid,
    });
    if (paper.timeOut) {
      ctx.throw(403, '考试已结束');
    }
    if (paper.submitted) {
      ctx.throw(403, '考试已结束');
    }
    const time = Date.now();
    const category = await db.ExamsCategoryModel.findOnly({ _id: paper.cid });
    if (category.disabled) {
      ctx.throw(403, `该科目下的考试已被屏蔽`);
    }
    const qid = paper.record.map((r) => r.qid);
    const questionsDB = await db.QuestionModel.find({ _id: { $in: qid } });
    const questionObj = {};
    for (const q of questionsDB) {
      questionObj[q._id] = q;
    }
    const { questions } = body;
    const { record } = paper;
    let score = 0;
    const q = {};
    for (let i = 0; i < record.length; i++) {
      const r = record[i];
      if (r.qid !== questions[i]._id) {
        ctx.throw(400, '试卷题目顺序有误，本次考试无效，请重新考试。');
      }
      const question = questionObj[r.qid];
      r.correct = false;
      if (question.type === 'ch4') {
        for (let j = 0; j < r.answerIndex.length; j++) {
          const index = r.answerIndex[j];
          if (question.answer[index] !== questions[i].ans[j]) {
            ctx.throw(400, '试卷题目答案顺序有误，本次考试无效，请重新考试。');
          }
          if (index === 0 && questions[i].answer === j) {
            r.correct = true;
            score++;
          }
        }
      } else {
        if (question.answer[0] === questions[i].answer) {
          r.correct = true;
          score++;
        }
      }
      record[i].answer = questions[i].answer;
    }
    q.record = record;
    q.score = score;
    q.passed = paper.passScore <= q.score;
    q.submitted = true;
    q.tlm = time;
    if (q.passed) {
      const userObj = {};
      userObj[`volume${category.volume}`] = true;
      if (category.volume === 'B') {
        userObj.volumeA = true;
      }
      await user.updateOne(userObj);
      for (const id of category.rolesId) {
        if (id) {
          await user.updateOne({ $addToSet: { certs: id } });
        }
      }
    }
    await paper.updateOne(q);
    data.passed = q.passed;
    await next();
  });
module.exports = paperRouter;
