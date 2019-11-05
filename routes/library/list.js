const router = require("koa-router")();
router
  .post("/", async (ctx, next) => {
    // 新建文件夹
    const {data, body, db} = ctx;
    const {library} = data;
    const {name, description} = body;
    await library.ensurePermission(data.user, "createFolder", ctx.permission("modifyAllResource"));
    data.library = await db.LibraryModel.newFolder({
      lid: library._id,
      name,
      description,
      uid: data.user.uid
    });
    await next();
  })
  // 移动文件夹
  .patch("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {foldersId, targetFolderId} = body;
    const {library} = data;
    const targetFolder = await db.LibraryModel.findOne({_id: targetFolderId, type: "folder", deleted: false});
    if(!targetFolderId) ctx.throw(400, `目标目录不正确`);
    const nav = await targetFolder.getNav();
    const navId = nav.map(n => n._id);
    let ignoreCount = 0;
    for(const _id of foldersId) {
      const folder = await db.LibraryModel.findOne({lid: library._id, _id, deleted: false});
      if(!folder) {
        ignoreCount++;
        continue;
      }
      try{
        if(folder.type === "file") {
          await folder.ensurePermission(data.user, "moveFile", ctx.permission("modifyAllResource"));
        } else {
          await folder.ensurePermission(data.user, "moveFolder", ctx.permission("modifyAllResource"));
        }
      } catch(err) {
        ignoreCount ++;
        continue;
      }
      
      // 当目标文件夹是已选文件夹的子文件夹时 忽略
      if(navId.includes(_id)) {
        ignoreCount++;
        continue;
      }

      const sameName = await db.LibraryModel.count({lid: targetFolderId, type: folder.type, name: folder.name, deleted: false});
      if(sameName) {
        ignoreCount++;
        continue;
      }
      await folder.update({lid: targetFolderId});
    }
    // 重新计算源文件夹及目标文件夹的文件和文件夹数量
    await targetFolder.computeCount();
    await library.computeCount();
    data.ignoreCount = ignoreCount;
    await next();
  })
  .del("/", async (ctx, next) => {
    const {data, db, query} = ctx;
    const {library} = data;
    let {lid} = query;
    lid = lid.split("-");
    lid = lid.map(l => Number(l));
    let ignoreCount = 0;
    for(const id of lid) {
      const folder = await db.LibraryModel.findOne({_id: id, lid: library._id});
      if(!folder) {
        ignoreCount ++;
        continue;
      }
      try{
        if(folder.type === "file") {
          await folder.ensurePermission(data.user, "deleteFile", ctx.permission("modifyAllResource"));
        } else {
          await folder.ensurePermission(data.user, "deleteFolder", ctx.permission("modifyAllResource"));
        }
      } catch(err) {
        ignoreCount ++;
        continue;
      }
      const foldersCount = await db.LibraryModel.count({lid: id, deleted: false});
      if(foldersCount > 0) {
        ignoreCount ++;
        continue;
      }
      await db.LibraryModel.update({_id: id}, {
        $set: {
          deleted: true
        }
      });
      if(folder.type === "file") {
        await db.LibraryModel.removeFromES(id);
      }
    }
    await library.computeCount();
    data.ignoreCount = ignoreCount;
    await next();
  });
module.exports = router;