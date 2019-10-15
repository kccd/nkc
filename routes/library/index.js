const router = require("koa-router")();
router
  .use("/:_id", async (ctx, next) => {
    const {data, db, params} = ctx;
    const {_id} = params;
    const library = await db.LibraryModel.findOne({_id});
    if(!library) ctx.throw(404, `library not found, id: ${_id}`);
    data.library = library;
    const forum = await db.ForumModel.findOne({libraryId: library._id});
    data.belongTo = "";
    if(forum) {
      data.belongTo = "forum";
      data.forum = forum;
      await next();
    } else {
      await next();
    }
  })
  .get("/:_id", async (ctx, next) => {
    const {data, db} = ctx;
    data.paging = {
      page: 21,
      pageCount: 438
    };
    ctx.template = "library/library.pug";
    await next();
  });
module.exports = router;