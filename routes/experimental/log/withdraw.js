const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, query, data, db} = ctx;
    const {page=0, t, content} = query;
    const q = {
      type: "withdraw"
    };
    if(!t) {}
    else if(t === "username") {
      const user = await db.UserModel.findOne({usernameLowerCase: content.toLowerCase()});
      if(!user) {
        data.info = "未找到用户";
      } else {
        q.from = user.uid;
      }
    } else if(t === "uid") {
      const user = await db.UserModel.findOne({uid: content});
      if(!user) {
        data.info = "未找到用户";
      } else {
        q.from = user.uid;
      }
    } else if(t === "ip") {
      q.ip = content;
    }
    const count = await db.KcbsRecordModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const records = await db.KcbsRecordModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.records = await db.KcbsRecordModel.extendKcbsRecords(records);
    data.mainScore = await db.SettingModel.getMainScore();
    ctx.template = "experimental/log/withdraw.pug";
    data.t = t;
    data.content = content;
    data.paging = paging;
    await next();
  });
module.exports = router;
