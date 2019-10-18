const router = require("koa-router")();
router
  .use("/", async(ctx, next) => {
    const {db, data, params} = ctx;
    const {rid} = params;
    const resource = await db.ResourceModel.findOne({rid});
    if(!resource) ctx.throw(404, `resource not found, rid: ${rid}`);
    data.resource = resource;
    await next();
  })
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    let resource = data.resource.toObject();
    const {forumsId, cover} = resource;
    data.forums = await db.ForumModel.find({fid: {$in: forumsId}});
    if(cover) {
      data.cover = await db.ResourceModel.findOne({rid: cover});
    }
    resource.user = await db.UserModel.findOne({uid: resource.uid});
    data.resource = resource;
    data.modifyAllResource = ctx.permission("modifyAllResource");
    await next();
  });
module.exports = router;