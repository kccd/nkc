const router = require("koa-router")();
router
  .get("/logs", async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    const {page = 0} = query;
    const count = await db.LibraryModel.count();
    const paging = nkcModules.apiFunction.paging(page, count);
    const libraries = await db.LibraryModel.find().sort({toc: -1}).skip(paging.start).limit(paging.limit);
    data.libraries = [];
    for(let library of libraries) {
      const nav = await library.getNav();
      library = library.toObject();
      library.user = await db.UserModel.findOne({uid: library.uid}, {uid: 1, avatar: 1, username: 1});
      const forum = await db.ForumModel.findOne({lid: nav[0]._id}, {displayName: 1, fid: 1, lid: 1});
      library.forum = forum;
      library.path = "/ " + nav.slice(0, -1).map(n => n.name).join(" / ");
      data.libraries.push(library);
    }
    data.paging = paging;
    ctx.template = "libraries/logs.pug";
    await next();
  });
module.exports = router;