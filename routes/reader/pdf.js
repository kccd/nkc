const router = require("koa-router")();
router
  .get("/web/viewer", async (ctx, next) => {
    const {nkcModules, db, query, data} = ctx;
    let {file} = query;
    file = file.replace(/^\/r\/([0-9]+)/i, "$1");
    const resource = await db.ResourceModel.findOnly({rid: file});
    const {ext} = resource;
    if(ext !== "pdf") ctx.throw(400, "仅支持预览pdf文件");
    ctx.template = "reader/pdf/web/viewer.pug";
    await next();
  });
module.exports = router;
