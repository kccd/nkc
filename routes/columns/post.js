const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {query, data, db, nkcModules} = ctx;
    const {page = 0, cid} = query;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const q = {
      columnId: column._id,
      cid
    };
    const count = await db.ColumnPostModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const columnPosts = await db.ColumnPostModel.find(q).sort({top: -1}).skip(paging.start).limit(paging.perpage);
    data.columnPosts = await db.ColumnPostModel.extendColumnPosts(columnPosts);
    data.paging = paging;
    await next();
  })
  .post("/", async (ctx, next) => {
    const {body, data, db} = ctx;
    const {postsId, categoryId, type} = body;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    if(!postsId || postsId.length === 0) ctx.throw(400, "最少包含一条内容");
    if(type === "addToColumn") {
      if(!categoryId) ctx.throw(400, "文章分类不能为空");
      const category = await db.ColumnPostCategoryModel.findOne({_id: categoryId, columnId: column._id});
      if(!category) ctx.throw(400, "文章分类不正确");
      for(const pid of postsId) {
        let columnPost = await db.ColumnPostModel.findOne({columnId: column._id, pid});
        if(columnPost) continue;
        const post = await db.PostModel.findOne({pid});
        if(!post || post.uid !== user.uid) continue;
        const thread = await db.ThreadModel.findOne({tid: post.tid});
        columnPost = db.ColumnPostModel({
          _id: await db.SettingModel.operateSystemID("columnPosts", 1),
          tid: thread.tid,
          top: post.toc,
          pid,
          type: thread.oc === pid? "thread": "post",
          columnId: column._id,
          cid: categoryId
        });
        await columnPost.save();
      }
    } else if(type === "removeColumnPostById") {
      for(const _id of postsId) {
        await db.ColumnPostModel.remove({_id, columnId: column._id});
      }
    } else if(type === "removeColumnPostByPid") {
      for(const pid of postsId) {
        await db.ColumnPostModel.remove({pid, columnId: column._id});
      }
    } else if(type === "moveById") {
      if(!categoryId) ctx.throw(400, "文章分类不能为空");
      const category = await db.ColumnPostCategoryModel.findOne({_id: categoryId, columnId: column._id});
      if(!category) ctx.throw(400, "文章分类不正确");
      await db.ColumnPostModel.updateMany({
        columnId: column._id,
        _id: {$in: postsId}
      }, {
        $set: {
          cid: categoryId
        }
      });
    }
    await next();
  });

module.exports = router;