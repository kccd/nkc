const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, t} = query;
    const {column} = data;
    let q;
    if(!t) {
      q = {
        columnId: column._id,
        passed: null
      };
    } else if(t === "passed") {
      q = {
        columnId: column._id,
        passed: {$ne: null}
      }
    } else {
      q = {
        columnId: column._id
      }
    }
    const count = await db.ColumnContributeModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const contributes = await db.ColumnContributeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.contributes = await db.ColumnContributeModel.extendContributes(contributes);
    data.resolvedCount = await db.ColumnContributeModel.countDocuments({columnId: column._id, passed: {$ne: null}});
    data.unresolvedCount = await db.ColumnContributeModel.countDocuments({columnId: column._id, passed: null});
    data.categories = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    ctx.template = "columns/settings/contribute.pug";
    data.paging = paging;
    data.t = t;
    data.highlight = "contribute";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {contributesId, type, reason, categoriesId} = body;
    const {column} = data;
    if(!categoriesId || categoriesId.length === 0) {
      if(type === "agree") ctx.throw(400, "请选择文章分类");
    }
    for(const _id of categoriesId) {
      const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
      if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
    }
    for(const _id of contributesId) {
      const contribute = await db.ColumnContributeModel.findOne({_id, columnId: column._id});
      if(!contribute || contribute.passed !== null) continue;
      const thread = await db.ThreadModel.findOne({tid: contribute.tid});
      if(!thread) continue;
      await contribute.updateOne({
        tlm: Date.now(),
        reason,
        passed: type === "agree"
      });
      if(type === "agree") {
        const p = await db.ColumnPostModel.findOne({columnId: column._id, pid: thread.oc});
        if(p) continue;
        const categoriesOrder = await db.ColumnPostModel.getCategoriesOrder(categoriesId);
        await db.ColumnPostModel({
          _id: await db.SettingModel.operateSystemID("columnPosts", 1),
          tid: thread.tid,
          from: "contribute",
          pid: thread.oc,
          columnId: column._id,
          type: "thread",
          order: categoriesOrder,
          top: thread.toc,
          cid: categoriesId
        }).save();
      }
      const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: contribute.uid,
        ty: "STU",
        ip: ctx.address,
        port: ctx.port,
        c: {
          type: "columnContributeChange",
          columnId: column._id
        }
      });
      await message.save();
      await ctx.redis.pubMessage(message);
    }
    await next();
  });
module.exports = router;