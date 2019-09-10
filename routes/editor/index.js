const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data, query} = ctx;
    const {type} = query;
    const {user} = data;
    await db.UserModel.checkUserBaseInfo(user);
    const authLevel = data.user.authLevel;
    if(!user.volumeA || authLevel < 1) {
      ctx.template = 'interface_notice.pug';
      return await next();
    }

    // 需要预制的专业和文章分类
    let selectedForumsId = [];
    let selectedCategoriesId = [];

    if(!type) { // 直接进编辑器
      data.type = "newThread";
    } else if(type === "forum") { // 在专业进编辑器，需要预制当前专业
      const {id} = query;
      data.type = "newThread";
      selectedForumsId = [id];
    } else if(type === "thread") {
      data.type = "newPost";
      const {id} = query;
      // 回复的文章
      const thread = await db.ThreadModel.findOnly({tid: id});
      // 验证用户是否有权限查看文章
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      const firstPost = await thread.extendFirstPost();
      data.thread = {
        tid: thread.tid,
        title: firstPost.t,
        url: `/t/${thread.tid}`
      }
    } else if(type === "post") {
      data.type = "modifyPost";
      const {id} = query;
      data.post = await db.PostModel.findOnly({pid: id});
      const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      data.postType = (thread.oc === data.post.pid)? "thread": "post";
      const firstPost = await thread.extendFirstPost();
      data.thread = {
        tid: thread.tid,
        title: firstPost.t,
        url: `/t/${thread.tid}`
      }
    }
    // 拓展专业信息
    data.mainForums = [];
    if(selectedForumsId.length) {
      const forums = await db.ForumModel.find({fid: {$in: selectedForumsId}});
      const categories = await db.ThreadTypeModel.find({cid: {$in: selectedCategoriesId}});
      const categoriesObj = {};
      for(const c of categories) {
        categoriesObj[c.fid] = c;
      }
      for(const forum of forums) {
        const category = categoriesObj[forum.fid];
        data.mainForums.push({
          fid: forum.fid,
          cid: category? category.cid: "",
          color: forum.color,
          fName: forum.displayName,
          cName: category? category.name: ""
        });
      }
    }
    ctx.template = "editor/editor.pug";
    await next();
  });
module.exports = router;