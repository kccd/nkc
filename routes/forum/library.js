const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules, params} = ctx;
    const {fid} = params;
    const forum = await db.ForumModel.findOnly({fid});
    await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
    const {t = "all", page = 0} = query;
    data.t = t;
    const q = {
      forumsId: forum.fid
    };
    if(t !== "all") {
      q.category = t;
    }
    const count = await db.ResourceModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const resources = await db.ResourceModel.find(q).sort({tlm: -1}).skip(paging.start).limit(paging.perpage);
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
    data.forum = forum;
    data.paging = paging;
    ctx.template = "library/library.pug";
    await next();
  });
module.exports = router;