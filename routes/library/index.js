const router = require("koa-router")();
const uploadRouter = require("./upload");
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
    const {data, db, query, nkcModules} = ctx;
    const {t = "all", page = 0} = query;
    const {library} = data;
    data.t = t;
    const q = {
      librariesId: library._id
    };
    if(t !== "all") {
      q.category = t;
    }
    const count = await db.ResourceModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const resources = await db.ResourceModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const usersId = resources.map(r => r.uid);
    const users = await db.UserModel.find({uid: {$in: usersId}});
    const usersObj = {};
    users.map(u => {
      usersObj[u.uid] = u;
    });
    data.resources = [];
    for(const r of resources) {
      const resource = r.toObject();
      resource.user = usersObj[r.uid];
      data.resources.push(resource);
    }
    data.paging = paging;
    ctx.template = "library/library.pug";
    await next();
  })
  .use("/:_id/upload", uploadRouter.routes(), uploadRouter.allowedMethods());
module.exports = router;