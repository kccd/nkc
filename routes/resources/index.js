const router = require("koa-router")();
const md5Router = require('./md5');
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
  })
  .use('/md5', md5Router.routes(), md5Router.allowedMethods());
module.exports = router;