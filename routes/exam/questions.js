const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {nkcModules, query, db, data} = ctx;
    let {t, fid, page = 0} = query;
    const q = {};
    data.t = t;
    if(t === 'pub') {
      q.public = true;
    } else {
      if(fid) {
        q.public = false;
        q.fid = fid;  
        data.fid = fid;
      }
    }
    const count = await db.QuestionModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count); 
    const questions = await db.QuestionModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.questions = await db.QuestionModel.extendQuestions(questions);
    const fids = await db.QuestionModel.distinct('fid');
    const forums = await db.ForumModel.find({fid: {$in: fids}});
    data.paging = paging;
    data.forums = await Promise.all(forums.map(async f => {
      const count = await db.QuestionModel.count({
        fid: f.fid,
        disabled: false,
        auth: true,
        public: false
      });
      const allCount = await db.QuestionModel.count({
        fid: f.fid,
        public: false
      });
      return {
        displayName: f.displayName,
        fid: f.fid,
        count,
        allCount
      }
    }));
    data.allPubCount = await db.QuestionModel.count({
      public: true
    });
    data.pubCount = await db.QuestionModel.count({
      public: true,
      disabled: false,
      auth: true
    });
    data.allCount = await db.QuestionModel.count();
    data.count = await db.QuestionModel.count({
      disabled: false,
      auth: true
    });
    ctx.template = 'exam/questions.pug';
    await next();
  });
module.exports = router;