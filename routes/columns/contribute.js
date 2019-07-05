const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const columnSettings = await db.SettingModel.findById("column");
    data.columnSettings = columnSettings.c;
    data.categories = await db.ColumnPostCategoryModel.getCategoryList(data.column._id);
    ctx.template = "columns/contribute/contribute.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {user, column} = data;
    if(user.uid === column.uid)  ctx.throw(400, "自己的专栏无需投稿，可在文章页直接将文章推送到专栏");
    let {threadsId, description, categoriesId} = body;
    if(threadsId.length === 0) ctx.throw(400, "请选择需要投稿的文章");
    if(!categoriesId || categoriesId.length === 0) ctx.throw(400, "请选择文章分类");
    for(const _id of categoriesId) {
      const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
      if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
    }
    for(const tid of threadsId) {
      const thread = await db.ThreadModel.findOne({tid, uid: user.uid});
      if(!thread) ctx.throw(400, `你不是ID为${tid}的文章作者，请刷新`);
      const p = await db.ColumnPostModel.findOne({
        columnId: column._id,
        pid: thread.oc
      });
      if(p) ctx.throw(400, `ID为${tid}的文章已经被加入到专栏了，请勿重复投稿`);
      let contribute = await db.ColumnContributeModel.findOne({columnId: column._id, pid: thread.oc, passed: null});
      if(contribute) {
        ctx.throw(400, `ID为${tid}的文章正在等待专栏主审核，请勿重复投稿`);
      }
      contribute = db.ColumnContributeModel({
        _id: await db.SettingModel.operateSystemID("columnContributes", 1),
        uid: user.uid,
        tid,
        pid: thread.oc,
        cid: categoriesId,
        description,
        columnId: column._id
      });
      await contribute.save();
    }
    const message = db.MessageModel({
      _id: await db.SettingModel.operateSystemID("messages", 1),
      r: column.uid,
      ty: "STU",
      ip: ctx.address,
      port: ctx.port,
      c: {
        type: "newColumnContribute",
        columnId: column._id
      }
    });
    await message.save();
    await ctx.redis.pubMessage(message);
    await next();
  });
module.exports = router;
