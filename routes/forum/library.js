const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    ctx.data.type = "library";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {forum, user} = data;
    if(forum.lid) {
      ctx.throw(400, "专业已开通文库");
    }

    const library = await db.LibraryModel.newFolder({
      name: forum.displayName,
      description: forum.description,
      uid: user.uid
    });

    await forum.update({lid: library._id});
    data.library = library;
    
    await next();
  });
module.exports = router;