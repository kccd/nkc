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
    const resource = data.resource;
    const {librariesId, cover} = resource;
    data.libraries = await db.LibraryModel.find({_id: {$in: librariesId}});
    if(cover) {
      data.cover = await db.ResourceModel.findOne({rid: cover});
    }
    data.resource = resource;
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {data, body, db, nkcModules} = ctx;
    const {resource, user} = data;
    const {checkString} = nkcModules.checkData;
    if(resource.uid !== user.uid && !ctx.permission("modifyAllResource")) ctx.throw(403, "权限不足");
    let {name, description, category, librariesId, cover} = body;
    const categories = ["book", "paper", "program", "media"];
    if(!categories.includes(category)) ctx.throw(400, "请选择文件类型");
    checkString(name, {
      name: "文件名称",
      maxLength: 60,
      minLength: 4
    });
    checkString(description, {
      name: "文件说明",
      minLength: 10,
      maxLength: 1000
    });
    if(!librariesId.length) ctx.throw(400, "请选择所属文库");
    for(const lib of librariesId) {
      const c = await db.LibraryModel.count({_id: lib});
      if(!c) ctx.throw(400, "文库ID异常，请自行备份已输入内容后，刷新页面重新选择所属文库");
    }
    const obj = {
      name,
      description,
      category,
      librariesId
    };
    if(cover) {
      const c = await db.ResourceModel.findOne({rid: cover, mediaType: "mediaPicture"});
      if(c) obj.cover = c.rid;
    }
    await resource.update(obj);
    await next();
  });
module.exports = router;