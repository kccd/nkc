const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "account/contribute/contribute.pug";
    const {nkcModules, data, db, query} = ctx;
    const {page = 0} = query;
    const {user} = data;
    const q = {
      uid: user.uid
    };
    const count = await db.ColumnContributeModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    const contributes = await db.ColumnContributeModel.find({uid: user.uid}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.contributes = await db.ColumnContributeModel.extendContributes(contributes);
    for(const c of data.contributes) {
      c.column = await db.ColumnModel.findOne({_id: c.columnId});
    }
    await next();
  });
module.exports = router;