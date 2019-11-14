const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data, query} = ctx;
    let {type, rid} = query;
    rid = rid.split("-");
    const q = {
      rid: {$in: rid}
    };
    if(type === "toLibrary") {
      q.mediaType = "mediaAttachment";
    }
    data.resources = await db.ResourceModel.find({rid: {$in: rid}});
    await next();
  });
module.exports = router;