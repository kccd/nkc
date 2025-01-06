const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const { query, db, data, nkcModules } = ctx;
    const { page = 0 } = query;
    let { t = '', content = '' } = query;
    t = t.trim();
    content = content.trim();
    const q = {};
    if (t === 'username') {
      const targetUser = await db.UserModel.findOne(
        {
          usernameLowerCase: content.toLowerCase(),
        },
        { uid: 1 },
      );
      if (!targetUser) {
        data.info = '用户未找到';
      } else {
        q.uid = targetUser.uid;
      }
    } else if (t === 'uid') {
      const targetUser = await db.UserModel.findOne(
        { uid: content },
        { uid: 1 },
      );
      if (!targetUser) {
        data.info = '用户未找到';
      } else {
        q.uid = targetUser.uid;
      }
    } else if (t === 'ip') {
      q.ip = content;
    }
    const count = await db.ExamsPaperModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const papers = await db.ExamsPaperModel.find(q)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.papers = await db.ExamsPaperModel.extendPapers(papers, {
      secretInfo: true,
    });
    data.paging = paging;
    data.t = t;
    data.content = content;
    ctx.template = 'experimental/log/exam/paperList.pug';
    await next();
  })
  .get('/paper/:paperId', async (ctx, next) => {
    const { params, db, data } = ctx;
    const { paperId } = params;
    const paper = await db.ExamsPaperModel.findOnly({ _id: paperId });
    let paperUser = null;
    if (paper.uid) {
      paperUser = await db.UserModel.findOnly(
        { uid: paper.uid },
        { uid: 1, username: 1 },
      );
    }
    const category = await db.ExamsCategoryModel.findOnly(
      { _id: paper.cid },
      {
        _id: 1,
        name: 1,
        volume: 1,
        level: 1,
      },
    );
    data.paper = paper;
    data.category = category;
    data.paperUser = paperUser;
    ctx.template = 'experimental/log/exam/paper.pug';
    await next();
  });

module.exports = router;
