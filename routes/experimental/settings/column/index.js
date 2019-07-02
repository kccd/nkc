const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "experimental/settings/column/column.pug";
    const columnSettings = await ctx.db.SettingModel.findById("column");
    ctx.data.columnSettings = columnSettings.c;
    ctx.data.grades = await ctx.db.UsersGradeModel.find({}).sort({_id: 1});
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {body, db} = ctx;
    let {
      xsfCount, digestCount, userGrade,
      contributeInfo, threadCount
    } = body;
    xsfCount = parseInt(xsfCount);
    if(xsfCount < 0) ctx.throw(400, "学术分不能小于0");
    digestCount = parseInt(digestCount);
    if(digestCount < 0) ctx.throw(400, "精华数不能小于0");
    threadCount = parseInt(threadCount);
    if(threadCount < 0) ctx.throw(400, "文章数不能小于0");
    userGrade = await Promise.all(userGrade.filter(async _id => {
      const g = await db.UsersGradeModel.findOne({_id});
      return !!g;
    }));
    if(!contributeInfo) ctx.throw(400, "投稿说明不能为空");
    await db.SettingModel.updateOne({
      _id: "column"
    }, {
      $set: {
        "c.xsfCount": xsfCount,
        "c.digestCount": digestCount,
        "c.userGrade": userGrade,
        "c.contributeInfo": contributeInfo,
        "c.threadCount": threadCount
      }
    });
    await next();
  });
module.exports = router;