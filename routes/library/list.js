const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, query, data} = ctx;
    const {fid, lid} = query;
    let library;
      if(fid) {
        const forum = await db.ForumModel.findOne({fid});
        data.forum = forum;
        if(!forum) ctx.throw(404, `forum not found. fid: ${fid}`);
        library = await db.LibraryModel.findOne({_id: forum.lid});
        if(!library) ctx.throw(404, `library not found. lid: ${forum.lid}`);
      } else {
        library = await db.LibraryModel.findOne({_id: lid});
        if(!library) ctx.throw(404, `library not found. lid: ${lid}`);
      }
      data.list = await library.getList();
      data.nav = await library.getNav();
      data.library = library; 
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, body, db} = ctx;
    const {lid, name, description} = body;
    data.library = await db.LibraryModel.newFolder({
      lid,
      name,
      description,
      uid: data.user.uid
    });
    await next();
  });
module.exports = router;