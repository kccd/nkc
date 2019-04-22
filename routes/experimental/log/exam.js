const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = 'experimental/log/exam.pug';
    const {query, db, data, nkcModules} = ctx;
    const {page = 0, t, content} = query;
    let q = {};
    data.t = t;
    data.content = content;
    if(t === "paper") {
      let paper = await db.ExamsPaperModel.findById(content);
      paper = (await db.ExamsPaperModel.extendPapers([paper], {secretInfo: true}))[0];
      for(const r of paper.record) {
        r.question = await db.QuestionModel.findOne({_id: r.qid});
      }
      data.paper = paper;
    } else {
      if(!t) {
        q = {};
      } else if(t === "username") {
        const targetUser = await db.UserModel.findOne({usernameLowerCase: content.toLowerCase()});
        if(!targetUser) {
          data.info = "用户未找到"
        } else {
          q = {
            uid: targetUser.uid
          };
        }
      } else if(t === "uid") {
        const targetUser = await db.UserModel.findOne({uid: content});
        if(!targetUser) {
          data.info = "用户未找到";
        } else {
          q = {
            uid: content
          };
        }
      } else if(t === "ip") {
        q = {
          ip: content
        };
      }
      const count = await db.ExamsPaperModel.count(q);
      const paging = nkcModules.apiFunction.paging(page, count);
      const papers = await db.ExamsPaperModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      data.papers = await db.ExamsPaperModel.extendPapers(papers, {secretInfo: true});
      data.paging = paging;
    }
    await next();
  });
module.exports = router;