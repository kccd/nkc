const Router = require('koa-router');
const examRouter = new Router();
const categoryRouter = require('./category');
const categoriesRouter = require('./categories');
const questionRouter = require('./question');
const paperRouter = require('./paper');
const editorRouter = require('./editor');
const authRouter = require('./auth');
const recordRouter = require('./record');
const questionsRouter = require('./questions');
examRouter
  .use(async (ctx, next) => {
    const {db, data} = ctx;
    const papers = await db.ExamsPaperModel.find({submitted: false, timeOut: false});
    const now = Date.now();
    await Promise.all(papers.map(async paper => {
      if(now - paper.toc >= paper.time*60*1000) {
        await paper.update({
          timeOut: true,
          tlm: paper.toc + paper.time*60*1000,
          passed: false
        });
      }
    }));
    if(data.user) {
      data.unViewedCount = await db.QuestionModel.count({uid: data.user.uid, viewed: false});
      data.unauthCount = await db.QuestionModel.count({
        disabled: false,
        auth: null
      });
    }
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = 'exam/home.pug';
    data.examsCategories = await db.ExamsCategoryModel.find({
      disabled: false
    }).sort({order: 1});
    const papers = await db.ExamsPaperModel.find({
      passed: true
    }).sort({toc: -1}).limit(10);
    data.papers = await db.ExamsPaperModel.extendPapers(papers);
    const result = await db.QuestionModel.aggregate([
      {
        $match: {
          disabled: false,
          auth: true
        }
      },
      {
        $sort: {
          toc: -1
        }
      },
      {
        $project: {
          uid: 1
        }
      },
      {
        $group: {
          _id: '$uid',
          count: {$sum: 1}
        }
      }, 
      {
        $limit: 12
      }
    ]);
    const usersList = [];
    const users = [];
    for(const r of result) {
      const user = await db.UserModel.findOnly({uid: r._id});
      users.push(user);
      usersList.push({
        user,
        count: r.count
      });
    }
    await db.UserModel.extendUsersInfo(users);
    data.usersList = usersList;
    data.examSettings = (await db.SettingModel.findOnly({_id: 'exam'})).c;
    await next();
  })
  .use('/record', recordRouter.routes(), recordRouter.allowedMethods())
  .use('/paper', paperRouter.routes(), paperRouter.allowedMethods())
  .use('/question', questionRouter.routes(), questionRouter.allowedMethods())
  .use('/editor', editorRouter.routes(), editorRouter.allowedMethods())
  .use('/categories', categoriesRouter.routes(), categoriesRouter.allowedMethods())
  .use('/auth', authRouter.routes(), authRouter.allowedMethods())
  .use('/questions', questionsRouter.routes(), questionsRouter.allowedMethods())
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods());

module.exports = examRouter;