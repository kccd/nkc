const router = require("koa-router")();
const libRouter = require("./library");
router
  .use("/", async (ctx, next) => {
    // 文库的权限判断
    await next();
  })
  .get("/", async (ctx, next) => {
    // 文件位置选择模块支持两种模式
    // 1. 根据提供的lid预加载所有上层文件夹中的子文件夹
    // 2. 根据提供的lid加载所有子文件夹
    const {db, query, nkcModules, data} = ctx;
    const {lid=null, type} = query;
    if(type === "init") {
      // 根据提供的lid预加载所有上层文件夹中的子文件夹
      // 根据提供的lid找到已被选择的文件夹
      // 再加载此文件夹的路径
      const library = await db.LibraryModel.findOne({_id: Number(lid), type: "folder", deleted: false});
      if(!library) ctx.throw(400, `文件夹ID异常，lid: ${lid}`);
      let nav = await library.getNav();
      nav = nav.map(n => n.toObject());
      
      // 构建虚拟数据 为了拓展顶层文件夹
      nav.unshift({
        _id: null
      });

      // 加载构成路径的文件夹的子文件夹
      for(let i = 0; i < nav.length; i++) {
        const n = nav[i];
        // 文件夹默认折叠
        n.close = true;
        // 文件夹默认未加载子文件夹
        n.loaded = false;
        const q = {
          lid: n._id,
          type: "folder",
          deleted: false
        };
        if(n._id === null) {
          // 根据专业权限 获取顶层文件夹
          const accessibleForumsId = await db.ForumModel.getAccessibleForumsId(
            data.userRoles,
            data.userGrade, 
            data.user
          );
          const forums = await db.ForumModel.find({fid: {$in: accessibleForumsId}, lid: {$ne: null}}, {lid: 1});
          librariesId = forums.map(f => f.lid);
          q._id = {$in: librariesId};
          q.closed = false;
        }
        let folders = await db.LibraryModel.find(q);
        folders = folders.map(f => {
          f = f.toObject();
          f.close = true;
          f.loaded = false;
          return f;
        })
        n.folders = nkcModules.pinyin.sortByFirstLetter("object", folders, "name");
        n.foldersId = n.folders.map(f => f._id);
        if(i !== 0) {
          // 记录上层文件夹 用于之后的组装树状结构查询
          n.parent = nav[i - 1];
        }
      }
      // 将文件夹数组组装成树状结构
      for(const n of nav) {
        if(!n.parent) continue;
        const parent = n.parent;
        // 路径文件夹默认展开
        parent.close = false;
        // 路径文件夹默认已加载子文件夹
        parent.loaded = true;
        // 去掉上层文件夹的引用
        delete n.parent;
        const index = parent.foldersId.indexOf(n._id);
        if(index === -1) continue;
        parent.folders.splice(index, 1, n);
      }
      
      // 文件夹树状结构
      data.folders = nav[0].folders;
      // 需要高亮的文件夹
      data.folder = nav.slice(-1)[0];

    } else if(type === "getFolders") {
      // 根据提供的lid加载所有子文件夹
      // 若lid为null则加载顶层文件夹
      const q = {
        type: "folder",
        deleted: false,
        lid
      };
      const folders = await db.LibraryModel.find(q);
      data.folders = nkcModules.pinyin.sortByFirstLetter("object", folders, "name");
    }
    await next();
  })
  .use("/:lid", libRouter.routes(), libRouter.allowedMethods());
module.exports = router;