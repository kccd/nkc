const router = require("koa-router")();
const uploadRouter = require("./upload");
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {fid, t = "all", page = 0} = query;
    data.t = t;
    data.fid = fid;
    const q = {
      forumsId: fid
    };
    if(t !== "all") {
      q.category = t;
    }
    const count = await db.ResourceModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const resources = await db.ResourceModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const usersId = resources.map(r => r.uid);
    const users = await db.UserModel.find({uid: {$in: usersId}});
    const usersObj = {};
    users.map(u => {
      usersObj[u.uid] = u;
    });
    data.resources = [];
    for(const r of resources) {
      const resource = r.toObject();
      resource.user = usersObj[r.uid];
      data.resources.push(resource);
    }
    data.paging = paging;
    ctx.template = "library/library.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, nkcModules, data} = ctx;
    let body, files;
    if(ctx.body.fields) {
      body = JSON.parse(ctx.body.fields.body);
      files = ctx.body.files;
    } else {
      body = ctx.body;
    }
    const {user} = data;
    await db.UserModel.ensurePostLibraryPermission(user.uid);
    let {cover, name, description, forumsId = [], rid, category, operation} = body;
    const resource = await db.ResourceModel.findOne({rid});
    if(!resource) ctx.throw(400, `resource not found, rid: ${rid}`);
    if(user.uid !== resource.uid && !ctx.permission("modifyAllResource")) ctx.throw(400, "权限不足");
    if(operation === "removeResourceFromLibrary") {
      // 仅仅是清空专业分类
      await resource.update({forumsId: []});
      try{
        await db.ResourceModel.removeFromES(rid);
      } catch(err) {
        if(err.status === 404) {
          ctx.throw(400, "文件不存在，可能已经从文库中删除了");
        }
        throw err;
      }
    } else {
      if(resource.mediaType === "mediaPicture") ctx.throw(400, "暂不支持上传文件到文库");
      const categories = ["book", "paper", "program", "media", "other"];
      if(!categories.includes(category)) ctx.throw(400, "请选择文件类型");
      const {checkString} = nkcModules.checkData;
      checkString(name, {
        name: "文件名称",
        minLength: 1,
        maxLength: 100
      });
      checkString(description, {
        name: "文件说明",
        minLength: 1,
        maxLength: 2000
      });
      const forums = await db.ForumModel.find({fid: {$in: forumsId}});
      forumsId = forums.map(f => f.fid);
      if(!forumsId.length) ctx.throw(400, "请选择专业邻域");
      const obj = {
        name,
        description,
        category,
        forumsId
      };
      if(!cover) {
        obj.cover = "";
      }
      if(!obj.tlm) obj.tlm = Date.now();
      await db.ResourceModel.updateOne({rid}, {
        $set: obj
      });
      const coverFile = files.cover;
      if(coverFile) {
        await nkcModules.file.saveResourceCover(rid, coverFile);
      }
      await db.ResourceModel.saveResourceToES(rid);
    }
    await next();
  })
  .use("/upload", uploadRouter.routes(), uploadRouter.allowedMethods());
module.exports = router;