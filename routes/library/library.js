const router = require("koa-router")();
const listRouter = require("./list");

router
  .use("/", async (ctx, next) => {
    const {db, params, data} = ctx;
    const {lid} = params;
    const library = await db.LibraryModel.findOne({_id: lid, deleted: false});
    if(!library) ctx.throw(404, `library not found. lid: ${lid}`);
    data.nav = await library.getNav();
    data.nav.map(l => {
      if(l.closed) ctx.throw(400, `文库已关闭，暂无法访问。`);
    });
    const topFolder = data.nav[0];
    const forum = await db.ForumModel.findOne({lid: topFolder._id});
    if(!forum) ctx.throw(400, `当前文件夹的顶层文件夹不属于任何专业，lid: ${topFolder._id}`);
    // 验证用户是否有权访问顶层文件夹所属专业
    await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
    data.library = library;
    await next();
  })
  .get("/", async (ctx, next) => {
    // 文件夹下的文件及文件夹信息
    const {data, query, db} = ctx;
    const {folder, file, nav, path, info, permission} = query;
    const {library} = data;
    if(folder) data.folders = await library.getFolders(); 
    if(file) data.files = await library.getFiles();
    // if(nav) data.nav = await library.getNav();
    if(path) {
      if(!data.nav) data.nav = await library.getNav();
      const name = data.nav.map(n => n.name);
      data.path = "/ " + name.join(" / ");
    }
    if(info) {
      data.library = await library.extend();
    }
    if(permission) {
      if(ctx.permission("modifyAllResource")) {
        data.permission = [
          "createFile", "modifyFile", "deleteFile", "moveFile",
          "createFolder", "modifyFolder", "deleteFolder", "moveFolder",
        ];
        data.permission.push("modifyOtherLibrary");
      } else {
        data.permission = await db.LibraryModel.getPermission(data.user);
      }
    }
    await next();
  })
  // 上传文件到文库
  .post("/", async (ctx, next) => {
    const {db, data} = ctx;
    let body, files;
    if(ctx.body.fields) {
      body = JSON.parse(ctx.body.fields.body);
      files = ctx.body.files;
    } else {
      body = ctx.body;
    }
    
    const {library} = data;

    await library.ensurePermission(data.user, "createFile", ctx.permission("modifyAllResource"));

    const {rid, name, category, description} = body;
    const resource = await db.ResourceModel.findOne({rid});
    if(!resource) ctx.throw(400, `rid异常，数据库中无对应的resource数据。rid: ${rid}`);
    
    const file = await db.LibraryModel.newFile({
      lid: library._id,
      resource,
      name,
      category,
      description
    });
    await db.LibraryModel.saveToES(file._id);
    await next();
  })
  .patch("/", async (ctx, next) => {
    // 修改文件或文件夹
    const {data, body, db} = ctx;
    const {library} = data;
    if(!library.lid) ctx.throw(403, "暂不允许修改顶层文件夹信息");
    const {name, description, category} = body;
    let obj = {
      name,
      description
    };
    if(library.type === "file") {
      await library.ensurePermission(data.user, "modifyFile", ctx.permission("modifyAllResource"));
      if(category && ["book", "paper", "program", "media", "other"].includes(category)) {
        obj.category = category;
      }
    } else {
      await library.ensurePermission(data.user, "modifyFolder", ctx.permission("modifyAllResource"));
    }
    await db.LibraryModel.checkLibraryInfo(library.type, {
      _id: library._id,
      name,
      description,
      lid: library.lid
    });
    await library.update(obj);
    if(library.type === "file") {
      await db.LibraryModel.saveToES(library._id);
    }
    await next();
  })
  .use("/list", listRouter.routes(), listRouter.allowedMethods());
module.exports = router;