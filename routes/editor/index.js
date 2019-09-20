const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data, query, state} = ctx;
    const {type} = query;
    const {user} = data;
    await db.UserModel.checkUserBaseInfo(user);
    const authLevel = data.user.authLevel;
    if(!user.volumeA || authLevel < 1) {
      ctx.template = 'interface_notice.pug';
      return await next();
    }
    ctx.template = "editor/editor.pug";
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
      };
      selectedForumsId = thread.mainForumsId || [];
    } else if(type === "post") { // 修改文章或者修改回复
      const {id} = query;
      data.post = await db.PostModel.findOnly({pid: id});
      const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      data.type = (thread.oc === data.post.pid)? "modifyThread": "modifyPost";
      const firstPost = await thread.extendFirstPost();

      if(data.post.l !== "html") {
        ctx.template = "interface_editor.pug";
        data.content = data.post.c;
        data.l = data.post.l;
        data.title = data.post.t;
      }

      data.thread = {
        tid: thread.tid,
        title: firstPost.t,
        url: `/t/${thread.tid}`
      };
      selectedForumsId = thread.mainForumsId || [];
    } else if(type === "forum_declare") { // 修改专业说明
      data.type = "modifyForumDeclare";
      const {id} = query;
      const forum = await db.ForumModel.findOnly({fid: id});
      if(!forum.moderators.includes(user.uid) && !ctx.permission("superModerator")) ctx.throw(403, "你没有权限编辑专业说明");
      data.post = {
        c: forum.declare
      };
      data.forum = {
        fid: forum.fid,
        title: forum.displayName,
        url: `/f/${forum.fid}`
      };
    } else if(type === "redit") { // 从草稿箱来
      const {id} = query;
      let draft = await db.DraftModel.findOne({did: id, uid: user.uid});
      if(!draft) ctx.throw(400, "草稿不存在或已被删除");
      draft = draft.toObject();
      data.draftId = draft.did;
      const {
        mainForumsId, categoriesId, desType, desTypeId
      } = draft;
      selectedForumsId = mainForumsId;
      selectedCategoriesId = categoriesId;
      data.post = draft;
      if(desType === "forum") { // 发表新帖
        data.type = "newThread";
      } else if(desType === "thread") { // 发表新回复
        data.type = "newPost";
        const thread = await db.ThreadModel.findOnly({tid: desTypeId});
        // 验证用户是否有权限查看文章
        const firstPost = await thread.extendFirstPost();
        data.thread = {
          tid: thread.tid,
          title: firstPost.t,
          url: `/t/${thread.tid}`
        };
        selectedForumsId = thread.mainForumsId;
      } else if(desType === "post") { // 编辑文章或编辑回复
        const post = await db.PostModel.findOnly({pid: desTypeId});
        const thread = await db.ThreadModel.findOnly({tid: post.tid});
        data.type = post.pid === thread.oc? "modifyThread": "modifyPost";
        const firstPost = await thread.extendFirstPost();
        data.post.pid = post.pid;
        data.thread = {
          tid: thread.tid,
          title: firstPost.t,
          url: `/t/${thread.tid}`
        };
        selectedForumsId = thread.mainForumsId;
      } else if(desType === "forumDeclare") { // 专业说明
        data.type = "modifyForumDeclare";
        const forum = await db.ForumModel.findOnly({fid: desTypeId});
        data.forum = {
          fid: forum.fid,
          title: forum.displayName,
          url: `/f/${forum.fid}`
        };
      } else {
        ctx.throw(400, `未知的草稿类型：${desType}`);
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

    // 根据类型加载最新的草稿
    if(type !== "redit") {
      let obj = {};
      if(data.type === "newThread") {
        obj = {desType: "forum"};
      } else if(data.type === "newPost") {
        obj = {
          desType: "thread",
          desTypeId: data.thread.tid
        };
      } else if(["modifyPost", "modifyThread"].includes(data.type)) {
        obj = {
          desType: "post",
          desTypeId: data.post.pid
        };
      } else {
        obj = {
          desType: "forumDeclare",
          desTypeId: data.forum.fid
        };
      }
      obj.uid = user.uid;
      const d = await db.DraftModel.findOne(obj).sort({toc: -1});
      if(d) data.oldDraft = {
        did: d.did,
        tlm: d.tlm || d.toc
      };
    }
    // 判断用户是否能够发表匿名内容
    if(data.type === "newThread") {
      data.havePermissionToSendAnonymousPost =
        await db.UserModel.havePermissionToSendAnonymousPost("postToForum", data.user.uid);
    } else if(data.type === "modifyThread") {
      data.havePermissionToSendAnonymousPost =
        await db.UserModel.havePermissionToSendAnonymousPost("postToForum", data.user.uid, selectedForumsId);
    } else if(["newPost", "modifyPost"].includes(data.type)) {
      data.havePermissionToSendAnonymousPost =
        await db.UserModel.havePermissionToSendAnonymousPost("postToThread", data.user.uid, selectedForumsId);
    } else {
      data.havePermissionToSendAnonymousPost = false;
    }
    const allowedAnonymousForums = await db.ForumModel.find({allowedAnonymousPost: true}, {fid: 1});
    data.allowedAnonymousForumsId = allowedAnonymousForums.map(f => f.fid);

    // 判断用户是否已经将文章转发到专栏
    if(["modifyPost", "modifyThread", "newPost"].includes(data.type) && state.userColumn) {
      data.addedToColumn = (await db.ColumnPostModel.count({columnId: state.userColumn._id, type: "thread", tid: data.thread.tid})) > 0;
    }
    // 判断用户是否有权限发起调查
    if(["modifyThread", "newThread"].includes(data.type)) {
      data.createSurveyPermission = await db.SurveyModel.ensureCreatePermission("postToForum", data.user.uid);
    }
    await next();
  });
module.exports = router;