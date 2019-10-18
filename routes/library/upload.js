const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data, query} = ctx;
    const {fid, rid} = query;
    data.rid = rid;
    data.forum = await db.ForumModel.findOne({fid});
    ctx.template = "library/upload.pug";
    await next();
  });
module.exports = router;