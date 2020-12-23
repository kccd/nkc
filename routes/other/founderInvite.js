const router = require("koa-router")();
router
  // 同意邀请成为创始人
  .get("/accept/:pfid", async (ctx, next) => {
    const { data, db, params, query } = ctx;
    const { user } = data;
    const { pfid } = params;
    const { res } = query;
    if(!user) {
      ctx.throw(503, "你无权访问");
    }
    if(res !== "resolved" && res !== "rejected") {
      data.message = "你未进行处理";
      return next();
    }
    const pForum = await db.PreparationForumModel.findOne({pfid});
    const { founders } = pForum;
    for(let founder of founders) {
      if(founder.uid === user.uid) {
        founder.accept = res;
        await db.PreparationForumModel.update({pfid}, {
          $set: { founders }
        });
        if(res === "resolved") {
          data.message = "你已接受邀请，你的账号名会显示在专业主页的\"专业创始人\"列表中";
        } else {
          data.message = "你已拒绝邀请";
        }
        return next();
      }
    }
    data.message = "你不是受邀用户";
    return next();
  })
  .get("/accept/:pfid/page", async (ctx, next) => {
    const { data, db, params } = ctx;
    const { user } = data;
    const { pfid } = params;
    if(!user) {
      ctx.throw(503, "你无权访问");
    }
    const pForum = await db.PreparationForumModel.findOne({pfid});
    const forumSettings = await db.SettingModel.getSettings('forum');
    data.pfid = pForum.pfid;
    data.forumName = pForum.info.newForumName;
    data.founderGuide = forumSettings.founderGuide;
    ctx.template = "experimental/reviewForum/accept.pug";
    return next();
  });
module.exports = router;
