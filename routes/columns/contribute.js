const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const columnSettings = await db.SettingModel.findById("column");
    data.columnSettings = columnSettings.c;
    data.categories = await db.ColumnPostCategoryModel.find({columnId: data.column._id}).sort({toc: 1});
    ctx.template = "columns/contribute/contribute.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {user, column} = data;
    if(user.uid === column.uid)  ctx.throw(400, "自己的专栏无需投稿，可在文章页直接将文章推送到专栏");
    let {threadsId, description, categoryId} = body;
    if(threadsId.length === 0) ctx.throw(400, "请选择需要投稿的文章");
    if(!categoryId) ctx.throw(400, "请选择文章分类");
    const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
    if(!category) ctx.throw(400, "文章分类错误，请刷新");
    for(const tid of threadsId) {
      const thread = await db.ThreadModel.findOne({tid, uid: user.uid});
      if(!thread) ctx.throw(400, `你不是ID为${tid}的文章作者，请刷新`);
      let contribute = await db.ColumnContributeModel.findOne({columnId: column._id, tid, passed: {$ne: false}});
      if(contribute) {
        if(contribute.passed) {
          ctx.throw(400, `ID为${tid}的文章已经在专栏了`);
        } else {
          ctx.throw(400, `ID为${tid}的文章正在等待专栏主审核，请勿重复投稿`);
        }
      }
      contribute = db.ColumnContributeModel({
        _id: await db.SettingModel.operateSystemID("columnContributes", 1),
        uid: user.uid,
        tid,
        cid: category._id,
        description,
        columnId: column._id
      });
      await contribute.save();
    }
    await next();
  });
module.exports = router;
