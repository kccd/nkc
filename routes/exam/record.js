const Router = require('koa-router');
const router = new Router();
router
  .get('/question', async (ctx, next) => {
    const {query, db, data, nkcModules} = ctx;
    const {user} = data;
    const {page = 0} = query;
    const q = {
      uid: user.uid
    };
    const count = await db.QuestionModel.count(q);
    const paging = await nkcModules.apiFunction.paging(page, count);
    const questions = await db.QuestionModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.questions = await db.QuestionModel.extendQuestions(questions);
    const qid = questions.map(q => q._id);
    await db.QuestionModel.updateMany({_id: {$in: qid}, viewed: false}, {$set: {viewed: true}});
    data.paging = paging;
    ctx.template = 'exam/record/question.pug';
    await next();
  })
  .get('/paper', async (ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {page = 0, t} = query;
    data.t = t;
    const q = {};
    if(t === 'self') {
      q.uid = data.user.uid
    } else {
      q.$or = [
        {
          submitted: true
        },
        {
          timeOut: true
        }
      ]
    }
    const count = await db.ExamsPaperModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const papers = await db.ExamsPaperModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.papers = await db.ExamsPaperModel.extendPapers(papers);
    data.paging = paging;
    ctx.template = 'exam/record/paper.pug';
    await next();
  });
module.exports = router;