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
const publicRouter = require('./public');
const { questionService } = require('../../services/exam/question.service');
const { Public, OnlyUser } = require('../../middlewares/permission');
examRouter
  .use(Public(), async (ctx, next) => {
    const { db, data } = ctx;
    const papers = await db.ExamsPaperModel.find({
      submitted: false,
      timeOut: false,
    });
    const now = Date.now();
    await Promise.all(
      papers.map(async (paper) => {
        if (now - paper.toc >= paper.time * 60 * 1000) {
          await paper.updateOne({
            timeOut: true,
            tlm: paper.toc + paper.time * 60 * 1000,
            passed: false,
          });
        }
      }),
    );
    if (data.user) {
      data.unViewedCount = await db.QuestionModel.countDocuments({
        uid: data.user.uid,
        viewed: false,
      });
      data.unauthCount = await db.QuestionModel.countDocuments({
        disabled: false,
        auth: null,
      });
    }
    await next();
  })
  .get('/', OnlyUser(), async (ctx, next) => {
    const { data, db, state } = ctx;
    ctx.template = 'exam/home.pug';
    const categoryTypes = await db.ExamsCategoryModel.getExamCategoryTypes();
    const categories = await db.ExamsCategoryModel.find({
      disabled: false,
    }).sort({ order: 1 });
    const categoriesId = categories.map((c) => c._id);
    let passRate = await db.ExamsPaperModel.aggregate([
      {
        $match: {
          cid: { $in: categoriesId },
          submitted: true,
        },
      },
      {
        $group: {
          _id: '$cid',
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] } },
        },
      },
      {
        $project: {
          cid: '$_id',
          _id: 0,
          passRate: { $divide: ['$passed', '$total'] },
        },
      },
    ]);
    passRate = passRate || [];
    const passRateObj = {};
    for (const r of passRate) {
      passRateObj[r.cid] = Math.round(r.passRate * 10000) / 10000;
    }
    const examsCategories = {
      secretA: [],
      secretB: [],
      publicA: [],
      publicB: [],
    };
    for (const category of categories) {
      const targetCategory = {
        _id: category._id,
        name: category.name,
        desc: category.description,
        passRate: passRateObj[category._id] || 0,
        type: category.type,
        volume: category.volume,
      };
      if (category.type === categoryTypes.secret) {
        if (category.volume === 'A') {
          examsCategories.secretA.push(targetCategory);
        } else {
          examsCategories.secretB.push(targetCategory);
        }
      } else {
        if (category.volume === 'A') {
          examsCategories.publicA.push(targetCategory);
        } else {
          examsCategories.publicB.push(targetCategory);
        }
      }
    }
    const papers = await db.ExamsPaperModel.find({
      passed: true,
    })
      .sort({ toc: -1 })
      .limit(10);
    data.papers = await db.ExamsPaperModel.extendPapers(papers);
    const result = await db.QuestionModel.aggregate([
      {
        $match: {
          disabled: false,
          auth: true,
        },
      },
      {
        $sort: {
          toc: -1,
        },
      },
      {
        $project: {
          uid: 1,
        },
      },
      {
        $group: {
          _id: '$uid',
          count: { $sum: 1 },
        },
      },
      {
        $limit: 12,
      },
    ]);
    const usersList = [];
    const users = [];
    for (const r of result) {
      const user = await db.UserModel.findOnly({ uid: r._id });
      users.push(user);
      usersList.push({
        user,
        count: r.count,
      });
    }
    await db.UserModel.extendUsersInfo(users);
    data.examsCategories = examsCategories;
    data.usersList = usersList;
    data.examSettings = await db.SettingModel.getSettings('exam');
    data.hasPermissionToCreateQuestions =
      await questionService.hasPermissionToCreateQuestions(state.uid);
    await next();
  })
  .use('/record', recordRouter.routes(), recordRouter.allowedMethods())
  .use('/paper', paperRouter.routes(), paperRouter.allowedMethods())
  .use('/question', questionRouter.routes(), questionRouter.allowedMethods())
  .use('/editor', editorRouter.routes(), editorRouter.allowedMethods())
  .use(
    '/categories',
    categoriesRouter.routes(),
    categoriesRouter.allowedMethods(),
  )
  .use('/auth', authRouter.routes(), authRouter.allowedMethods())
  .use('/questions', questionsRouter.routes(), questionsRouter.allowedMethods())
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/public', publicRouter.routes(), publicRouter.allowedMethods());

module.exports = examRouter;
