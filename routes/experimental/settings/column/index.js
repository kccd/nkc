const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "experimental/settings/column/column.pug";
    const columnSettings = await ctx.db.SettingModel.findById("column");
    ctx.data.columnSettings = columnSettings.c;
    ctx.data.grades = await ctx.db.UsersGradeModel.find({}).sort({_id: 1});
    ctx.data.roles = await ctx.db.RoleModel.find({}).sort({toc: -1});
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {body, db} = ctx;
    let {
      xsfCount, digestCount, userGrade,
      contributeInfo, threadCount, transferInfo, closeColumnInfo,
      adminCertsId, pageCount
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
    adminCertsId = await Promise.all(adminCertsId.filter(async _id => {
      const cert = await db.RoleModel.findOne({_id});
      return !!cert;
    }));
    if(!contributeInfo) ctx.throw(400, "投稿说明不能为空");
    if(!transferInfo) ctx.throw(400, "专栏转让说明不能为空");
    if(!closeColumnInfo) ctx.throw(400, "关闭专栏说明不能为空");
    pageCount = parseInt(pageCount);
    if(pageCount < 0) ctx.throw(400, "自定义页面个数不能小于0");
    await db.SettingModel.updateOne({
      _id: "column"
    }, {
      $set: {
        "c.xsfCount": xsfCount,
        "c.digestCount": digestCount,
        "c.userGrade": userGrade,
        "c.contributeInfo": contributeInfo,
        "c.threadCount": threadCount,
        "c.pageCount": pageCount,
        "c.transferInfo": transferInfo,
        "c.closeColumnInfo": closeColumnInfo,
        "c.adminCertsId": adminCertsId
      }
    });
    await next();
  });
module.exports = router;