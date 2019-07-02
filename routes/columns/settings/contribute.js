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
        passed: true
      }
    } else {
      q = {
        columnId: column._id
      }
    }
    const count = await db.ColumnContributeModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const contributes = await db.ColumnContributeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.contributes = await db.ColumnContributeModel.extendContributes(contributes);
    data.resolvedCount = await db.ColumnContributeModel.count({columnId: column._id, passed: {$ne: null}});
    data.unresolvedCount = await db.ColumnContributeModel.count({columnId: column._id, passed: null});
    data.categories = await db.ColumnPostCategoryModel.find({columnId: column._id}).sort({toc: 1});
    ctx.template = "columns/settings/contribute.pug";
    data.paging = paging;
    data.t = t;
    data.highlight = "contribute";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {contributesId, type, reason, cid} = body;
    const {column} = data;
    const category = await db.ColumnPostCategoryModel.findOne({_id: cid, columnId: column._id});
    if(!category) ctx.throw(400, "文章分类不存在，请刷新");
    for(const _id of contributesId) {
      const contribute = await db.ColumnContributeModel.findOne({_id, columnId: column._id});
      if(!contribute) continue;
      const thread = await db.ThreadModel.findOne({tid: contribute.tid});
      if(!thread) continue;
      await contribute.update({
        tlm: Date.now(),
        reason,
        passed: type === "agree"
      });
      await db.ColumnPostModel({
        _id: await db.SettingModel.operateSystemID("columnPosts", 1),
        tid: thread.tid,
        pid: thread.oc,
        columnId: column._id,
        type: "thread",
        top: thread.toc,
        cid
      }).save();
    }
    await next();
  });
module.exports = router;