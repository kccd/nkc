const router = require('koa-router')();
const { paperService } = require('../../../../services/exam/paper.service');
const {
  categoryService,
} = require('../../../../services/exam/category.service');
router
  .get('/register', async (ctx, next) => {
    const { db } = ctx;
    const {
      c: { registerExamination },
    } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
    ctx.apiData = {
      registerExamination,
    };
    await next();
  })
  .get('/paper/:pid', async (ctx, next) => {
    //获取开卷考试的题目数据
    const {
      params: { pid },
      db,
    } = ctx;
    const ip = ctx.address;
    await paperService.checkPaperLegal(pid, ip);
    const paper = await db.ExamsPaperModel.findOnly({ _id: pid, ip });
    const hasFinish = await paperService.checkIsFinishPaper(pid);
    if (hasFinish === -1) {
      ctx.throw('当前试卷已经做完');
    }
    let index = hasFinish;
    const { record } = paper;
    const question = record[index];
    const { hasImage } = await db.QuestionModel.findOnly(
      { _id: question.qid },
      { hasImage: 1 },
    );
    let isMultiple = [];
    if (question.type === 'ch4') {
      isMultiple = question.answer.filter((item) => item.correct);
      question.answer = question.answer.map((item) => {
        const { text, _id } = item;
        return { text, _id };
      });
    } else {
      question.answer = [];
    }
    const { answer, content, type, contentDesc, qid } = question;
    const category = await categoryService.getCategoryById(paper.cid);
    ctx.apiData = {
      question: {
        answer,
        content,
        qid,
        type,
        contentDesc,
        hasImage,
        isMultiple: isMultiple.length > 1,
      },
      questionTotal: record.length,
      index,
      paperName: `${category.name} ${
        category.volume === 'A' ? '基础级' : '专业级'
      }`,
      paperTime: paper.toc,
      paperQuestionCount: `${paper.record.length - index - 1} / ${
        paper.record.length
      }`,
    };
    await next();
  })
  .post('/result/:pid', async (ctx, next) => {
    const {
      body,
      params: { pid },
      db,
    } = ctx;
    const { index, qid, selected, fill } = body;
    const ip = ctx.address;
    await paperService.checkPaperLegal(pid, ip);
    const paper = await db.ExamsPaperModel.findOnly({ _id: pid, ip });
    const { ch4, ans } = await db.QuestionModel.getQuestionType();
    const { record } = paper;
    if (Number(index) > record.length - 1) {
      ctx.throw(404, '所做题目与实际不符，请刷新');
    }
    const question = record[index];
    if (qid !== question.qid) {
      ctx.throw(404, '所做题目与实际不符，请刷新');
    }
    const { type } = question;
    //选择题
    if (type === ch4) {
      if (selected.length === 0) {
        ctx.throw(403, '当前选项不能为空');
      }
      // 生成一份答案描述数组
      const answerDesc = question.answer.map((item, index) => {
        const { desc, _id } = item;
        if (selected.includes(index)) {
          return { desc, _id };
        } else {
          return { desc: '', _id };
        }
      });
      // 判断用户的选项数量是否满足
      const correctQ = question.answer.filter((item) => item.correct);
      const picked = question.answer.filter(
        (item, indexQ) => selected.includes(indexQ) && item.correct,
      );
      // 判断是否答案有误
      const isAnswerIncorrect =
        selected.length !== correctQ.length ||
        correctQ.length !== picked.length;
      // 更新试卷数据
      await paperService.updatePaperCh4(
        pid,
        index,
        selected,
        !isAnswerIncorrect,
      );
      // 根据是否答案有误，设置返回数据
      if (isAnswerIncorrect) {
        ctx.apiData = {
          status: 403,
          message: '答案有误',
          answerDesc,
        };
      } else {
        ctx.apiData = {
          status: 200,
          message: '答案正确',
          pid,
          index: Number(index) + 1,
        };
      }
    } else if (type === ans) {
      if (fill === '') {
        ctx.throw(403, '当前问题答案不能为空');
      }
      const isAnswerIncorrect = question.answer[0].text !== fill;
      await paperService.updatePaperAns(pid, index, fill, !isAnswerIncorrect);
      const answerDesc = {
        desc: question.answer[0].desc,
        _id: question.answer[0]._id,
      };
      if (isAnswerIncorrect) {
        ctx.apiData = {
          status: 403,
          message: '答案有误',
          answerDesc,
        };
      } else {
        ctx.apiData = {
          status: 200,
          message: '答案正确',
          index: Number(index) + 1,
        };
      }
    }
    await next();
  })
  .post('/final-result/:pid', async (ctx, next) => {
    const {
      params: { pid },
      db,
    } = ctx;
    const hasFinish = await paperService.checkIsFinishPaper(pid);
    const paper = await db.ExamsPaperModel.findOnly({ _id: pid });
    const { record, from } = paper;
    const { register, exam } = await db.ExamsPaperModel.getFromType();
    if (hasFinish !== -1) {
      ctx.throw('该用户还未完成试卷');
    } else {
      const score = record.length;
      const time = Date.now();
      await db.ExamsPaperModel.updateOne(
        { _id: pid },
        {
          submitted: true,
          tlm: time,
          passed: true,
          score,
        },
      );

      if (from === register) {
        const activationCode = await paperService.createActivationCodeByPaperId(
          pid,
        );
        ctx.apiData = {
          redirectUrl: `/login?t=register`,
          activationCode: activationCode._id,
          from,
        };
      } else if (from === exam) {
        ctx.apiData = {
          redirectUrl: `/exam`,
          activationCode: '',
          from,
        };
      }
    }
    await next();
  });

module.exports = router;
