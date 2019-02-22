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
    const {page = 0, t, sortby, cat} = query;
    data.t = t;
    data.sortby = sortby;
    data.cat = cat;
    const q = {};
    if(t === 'self') {
      q.uid = data.user.uid
    } else {
      if(!ctx.permission('viewAllPaperRecords')) ctx.throw(403, '权限不足');
      if(sortby && cat) {
        if(sortby === 'username') {
          const targetUser = await db.UserModel.findOne({usernameLowerCase: cat.toLowerCase()});
          if(!targetUser) ctx.throw(400, `用户不存在`);
          q.uid = targetUser.uid;
        } else if(sortby === 'uid') {
          const targetUser = await db.UserModel.findOne({uid: cat});
          if(!targetUser) ctx.throw(400, `用户不存在`);
          q.uid = targetUser.uid;
        }
      }
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