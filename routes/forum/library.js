const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    ctx.data.type = "library";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {forum} = data;
    const {type} = body;
    if(type === "create") {
      await forum.createLibrary(data.user.uid);
    } else{
      if(!forum.lid) ctx.throw(400, "专业暂未开设文库");
      const library = await db.LibraryModel.findOnly({_id: forum.lid});
      if(!library) ctx.throw(400, `未找到文库, lid: ${forum.lid}`);
      if(type === "open") {
        if(!library.closed) ctx.throw(400, "文库未关闭");
        await library.update({closed: false});
      } else {
        if(library.closed) ctx.throw(400, "文库已关闭");
        await library.update({closed: true});
      } 
    }    
    await next();
  });
module.exports = router;