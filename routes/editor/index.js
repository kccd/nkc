const markNotes = require('../../nkcModules/nkcRender/markNotes');
const Router = require("koa-router");
const router = new Router();

router
  // .get("/", async (ctx, next) => {
  //   const {db, data, query, state} = ctx;
  //   const {type} = query;
  //   const {user} = data;
  //   await db.UserModel.checkUserBaseInfo(user);
  //   ctx.template = "editor/editor.pug";

  //   data.notice = '';

  //   // 需要预制的专业和文章分类
  //   let selectedForumsId = [];
  //   let selectedCategoriesId = [];

  //   // 取网站代号
  //   let serverSetting = await db.SettingModel.getSettings("server");
  //   data.websiteCode = String(serverSetting.websiteCode).toLocaleUpperCase();

  //   if(!type) { // 直接进编辑器
  //     data.type = "newThread";
  //   } else if(type === "forum") { // 在专业进编辑器，需要预制当前专业
  //     const {id} = query;
  //     data.type = "newThread";
  //     // 判断用户是否用有制定专业的发表权限
  //     try{
  //       await db.ForumModel.checkWritePermission(state.uid, [id]);
  //       selectedForumsId = [id];
  //     } catch(err) {
  //       data.permissionInfo = err.message;
  //     }
  //   } else if(type === "thread") {
  //     data.type = "newPost";
  //     const {id} = query;
  //     // 回复的文章
  //     const thread = await db.ThreadModel.findOnly({tid: id});
  //     // 验证用户是否有权限查看文章
  //     await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
  //     const firstPost = await thread.extendFirstPost();
  //     data.thread = {
  //       tid: thread.tid,
  //       title: firstPost.t,
  //       url: `/t/${thread.tid}`
  //     };
  //     selectedForumsId = thread.mainForumsId || [];
  //   } else if(type === "post") { // 修改文章或者修改回复
  //     const {id} = query;
  //     data.post = await db.PostModel.findOnly({pid: id});
  //     // -> 把笔记标记在文中
  //     // let notes = await db.NoteModel.find({type: "post", targetId: data.post.pid});
  //     let notes = (await db.NoteModel.getNotesByPost(data.post)).notes;
  //     data.post.c = markNotes.setMark(data.post.c, notes.map(note => note.toObject()));
  //     // <- 把笔记标记在文中
  //     const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
  //     await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
  //     data.type = (thread.oc === data.post.pid)? "modifyThread": "modifyPost";
  //     const firstPost = await thread.extendFirstPost();
  //     let parentPostCount;
  //     if(data.post.parentPostId) {
  //       parentPostCount = await db.PostModel.countDocuments({pid: data.post.parentPostId});
  //     }

  //     data.thread = {
  //       tid: thread.tid,
  //       title: firstPost.t,
  //       url: `/t/${thread.tid}`,
  //       comment: !!parentPostCount
  //     };
  //     selectedForumsId = thread.mainForumsId || [];
  //   } else if(type === "forum_declare") { // 修改专业说明
  //     data.type = "modifyForumDeclare";
  //     const {id} = query;
  //     const forum = await db.ForumModel.findOnly({fid: id});
  //     if(!forum.moderators.includes(user.uid) && !ctx.permission("superModerator")) ctx.throw(403, "你没有权限编辑专业说明");
  //     // 渲染nkcsource
  //     data.post = {
  //       c: forum.declare
  //     };
  //     data.forum = {
  //       fid: forum.fid,
  //       title: forum.displayName,
  //       url: `/f/${forum.fid}`
  //     };
  //   } else if(type === "redit") { // 从草稿箱来
  //     let {id, o} = query;
  //     let draft = await db.DraftModel.findOne({did: id, uid: user.uid});
  //     if(!draft) ctx.throw(400, "草稿不存在或已被删除");
  //     draft = draft.toObject();
  //     if(!['copy', 'update'].includes(o)) {
  //       o = 'update';
  //     }
  //     const {
  //       mainForumsId, categoriesId, desType, desTypeId, parentPostId
  //     } = draft;

  //     // 更新原有内容
  //     if(o === 'update') {
  //       data.draftId = draft.did;
  //       data.post = draft;
  //       selectedForumsId = mainForumsId;
  //       selectedCategoriesId = categoriesId;
  //     } else {
  //       // 复制为新文章
  //       data.post = {
  //         t: draft.t,
  //         c: draft.c,
  //         l: draft.l,
  //         abstractCn: '',
  //         abstractEn: '',
  //         keyWordsCn: [],
  //         keyWordsEn: [],
  //         authorInfos: [],
  //         mainForumsId: [],
  //         categoriesId: []
  //       }
  //     }
  //     if(desType === "forum" || o === 'copy') { // 发表新帖
  //       data.type = "newThread";
  //     } else if(desType === "thread") { // 发表新回复
  //       data.type = "newPost";
  //       const thread = await db.ThreadModel.findOnly({tid: desTypeId});
  //       // 验证用户是否有权限查看文章
  //       const firstPost = await thread.extendFirstPost();
  //       let parentPost;
  //       if(parentPostId) {
  //         parentPost = await db.PostModel.findOne({pid: parentPostId});
  //       }
  //       data.thread = {
  //         tid: thread.tid,
  //         title: firstPost.t,
  //         url: `/t/${thread.tid}`,
  //         comment: !!parentPost
  //       };
  //       selectedForumsId = thread.mainForumsId;
  //     } else if(desType === "post") { // 编辑文章或编辑回复
  //       const post = await db.PostModel.findOnly({pid: desTypeId});
  //       const thread = await db.ThreadModel.findOnly({tid: post.tid});
  //       data.type = post.pid === thread.oc? "modifyThread": "modifyPost";
  //       const firstPost = await thread.extendFirstPost();
  //       let parentPost;
  //       if(parentPostId) {
  //         parentPost = await db.PostModel.findOne({pid: parentPostId});
  //       }
  //       data.post.pid = post.pid;
  //       data.thread = {
  //         tid: thread.tid,
  //         title: firstPost.t,
  //         url: `/t/${thread.tid}`,
  //         comment: !!parentPost
  //       };
  //       selectedForumsId = thread.mainForumsId;
  //     } else if(desType === "forumDeclare") { // 专业说明
  //       data.type = "modifyForumDeclare";
  //       const forum = await db.ForumModel.findOnly({fid: desTypeId});
  //       data.forum = {
  //         fid: forum.fid,
  //         title: forum.displayName,
  //         url: `/f/${forum.fid}`
  //       };
  //     } else {
  //       ctx.throw(400, `未知的草稿类型：${desType}`);
  //     }
  //   } else if(type === "forum_latest_notice") {
  //     data.type = "modifyForumLatestNotice";
  //     const {id} = query;
  //     const forum = await db.ForumModel.findOnly({fid: id});
  //     if(!forum.moderators.includes(user.uid) && !ctx.permission("superModerator")) ctx.throw(403, "你没有权限编辑专业最新页板块公告");
  //     // 渲染nkcsource
  //     data.post = {
  //       c: forum.latestBlockNotice
  //     };
  //     data.forum = {
  //       fid: forum.fid,
  //       title: forum.displayName,
  //       url: `/f/${forum.fid}`
  //     };
  //   }
  //   // 拓展专业信息
  //   data.mainForums = [];
  //   if(selectedForumsId.length) {
  //     const forums_ = await db.ForumModel.find({fid: {$in: selectedForumsId}});
  //     const forums = [];
  //     for(const f of forums_) {
  //       const childForumsId = [] || await f.getAllChildForumsId();
  //       if(!childForumsId.length) forums.push(f);
  //     }
  //     const categories = await db.ThreadTypeModel.find({fid: {$in: forums.map(f => f.fid)}}).sort({order: 1});
  //     const categoriesObj = {};
  //     const selectedCategoriesObj = {};
  //     const cfObj = {};
  //     for(const c of categories) {
  //       categoriesObj[c.cid] = c;
  //       if(!cfObj[c.fid]) cfObj[c.fid] = [];
  //       cfObj[c.fid].push(c);
  //       if(selectedCategoriesId.includes(c.cid)) {
  //         selectedCategoriesObj[c.fid] = c;
  //       }
  //     }
  //     for(const forum of forums) {
  //       const category = selectedCategoriesObj[forum.fid];
  //       const f = forum.toObject();
  //       f.threadTypes = cfObj[f.fid] || [];
  //       data.mainForums.push({
  //         forum: f,
  //         fid: forum.fid,
  //         cid: category? category.cid: null,
  //         description: forum.description,
  //         color: forum.color,
  //         logo: forum.logo,
  //         banner: forum.banner,
  //         fName: forum.displayName,
  //         cName: category? category.name: ""
  //       });
  //     }
  //   }

  //   // 根据类型加载最新的草稿
  //   /* if(type !== "redit") {
  //     let obj = {};
  //     if(data.type === "newThread") {
  //       obj = {desType: "forum"};
  //     } else if(data.type === "newPost") {
  //       obj = {
  //         desType: "thread",
  //         desTypeId: data.thread.tid
  //       };
  //     } else if(["modifyPost", "modifyThread"].includes(data.type)) {
  //       obj = {
  //         desType: "post",
  //         desTypeId: data.post.pid
  //       };
  //     } else {
  //       obj = {
  //         desType: "forumDeclare",
  //         desTypeId: data.forum.fid
  //       };
  //     }
  //     obj.uid = user.uid;
  //     const d = await db.DraftModel.findOne(obj).sort({toc: -1});
  //     if(d) data.oldDraft = {
  //       did: d.did,
  //       tlm: d.tlm || d.toc
  //     };
  //   } */
  //   // 判断用户是否能够发表匿名内容
  //   if(data.type === "newThread") {
  //     data.havePermissionToSendAnonymousPost =
  //       await db.UserModel.havePermissionToSendAnonymousPost("postToForum", data.user.uid);
  //   } else if(data.type === "modifyThread") {
  //     data.havePermissionToSendAnonymousPost =
  //       await db.UserModel.havePermissionToSendAnonymousPost("postToForum", data.user.uid, selectedForumsId);
  //   } else if(["newPost", "modifyPost"].includes(data.type)) {
  //     data.havePermissionToSendAnonymousPost =
  //       await db.UserModel.havePermissionToSendAnonymousPost("postToThread", data.user.uid, selectedForumsId);
  //   } else {
  //     data.havePermissionToSendAnonymousPost = false;
  //   }
  //   const allowedAnonymousForums = await db.ForumModel.find({allowedAnonymousPost: true}, {fid: 1});
  //   data.allowedAnonymousForumsId = allowedAnonymousForums.map(f => f.fid);

  //   // 判断用户是否已经将文章转发到专栏
  //   if(["modifyPost", "modifyThread", "newPost"].includes(data.type) && state.userColumn) {
  //     data.addedToColumn = (await db.ColumnPostModel.countDocuments({columnId: state.userColumn._id, type: "thread", tid: data.thread.tid})) > 0;
  //   }
  //   // 判断用户是否是在专栏主页点击了「我要投稿」
  //   if(state.userColumn && query.toColumn === 'true' && data.type === 'newThread') {
  //     data.toColumn = true;
  //   }
  //   if(["modifyThread", "newThread"].includes(data.type)) {
  //     // 判断用户是否有权限发起调查
  //     data.createSurveyPermission = await db.SurveyModel.ensureCreatePermission("postToForum", data.user.uid);
  //     // 获取发表设置中原创申明文章内容最小字数限制
  //     const postSettings = await db.SettingModel.getSettings("post");
  //     data.originalWordLimit = postSettings.postToForum.originalWordLimit;
  //     data.minorForumCount = postSettings.postToForum.minorForumCount;
  //   }

  //   if(data.type === "newThread") {
  //     try{
  //       await db.UserModel.ensurePostThreadPermission(user.uid);
  //     } catch(err) {
  //       data.permissionInfo = `你暂无法发表内容，因为${err.message}。`;
  //     }
  //   }

  //   // 编辑器上边有关权限的提示
  //   if(data.type === 'newPost') {
  //     data.postPermission = await db.UserModel.getPostPermission(state.uid, 'post', selectedForumsId);
  //   } else if(data.type === 'newThread') {
  //     data.postPermission = await db.UserModel.getPostPermission(state.uid, 'thread', []);
  //   }

  //   state.editorSettings = await db.SettingModel.getSettings("editor");

  //   // 多维分类
  //   data.threadCategories = await db.ThreadCategoryModel.getCategoryTree({disabled: false});
  //   const {id} = query;

  //   data.reqUrl = {
  //    type,
  //    id
  //   }
  //   await next();
  // })
  .get('/', async (ctx, next)=>{
    const {db, data, query} = ctx;
    const {user} = data;
    await db.UserModel.checkUserBaseInfo(user);
    ctx.template = "editor/editor.pug";
    const {id, type, o} = query;
    const typeMap = {
      'newThread': '新文章',
      'modifyThread': '修改文章',
      'newPost': '新回复',
      'modifyPost': '修改回复',
      'newComment': '新评论',
      'modifyComment': '修改评论',
      'redit': o === 'update' ? '更新已发布的文章' :
        o === 'copy' ? '复制为新文章' : ''
    }
    if (!typeMap[type]) ctx.throw(400, '编辑器类型错误');
    data.reqUrl = {
     type,
     typeCn: typeMap[type],
     id,
     o
    }
    await next();
  })
  // 获取不同编辑器基本内容
  .get('/data', async (ctx, next)=>{
    const {db, data, query, state} = ctx;
    const {type, id} = query;
    const {user} = data;
    data.columnPermission = await db.UserModel.ensureApplyColumnPermission(data.user);
    data.userColumn = await db.UserModel.getUserColumn(state.uid);
    const draftDesType = await db.DraftModel.getDesType();
    await db.UserModel.checkUserBaseInfo(user);
    data.notice = '';
    // 需要预制的专业和文章分类
    let selectedForumsId = [];
    let selectedCategoriesId = [];

    // 取网站代号
    let serverSetting = await db.SettingModel.getSettings("server");
    data.websiteCode = String(serverSetting.websiteCode).toLocaleUpperCase();
    // data.type 用于请求草稿提示，用于获取draft表中指定类型的数据
    // 直接进编辑器
    if(!type) {
      data.type = "newThread";
    } else if(type === draftDesType.newThread) {
      // 在专业进编辑器，需要预制当前专业
      const {id} = query;
      data.type = "newThread";
      // 判断用户是否用有制定专业的发表权限
      try{
        await db.ForumModel.checkWritePermission(state.uid, [id]);
        selectedForumsId = [id];
      } catch(err) {
        data.permissionInfo = err.message;
      }
    }
    // else if(type === "thread") {
    else if(type === draftDesType.newPost) {
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
        url: `/t/${thread.tid}`,
        oc: thread.oc, // 文章
        lm: thread.lm
      };
      // type === thread
      // 新回复
      selectedForumsId = thread.mainForumsId || [];
    }
    /* else if(type === "post") { // 修改文章或者修改回复
      const {id} = query;
      data.post = await db.PostModel.findOnly({pid: id});
      // -> 把笔记标记在文中
      // let notes = await db.NoteModel.find({type: "post", targetId: data.post.pid});
      let notes = (await db.NoteModel.getNotesByPost(data.post)).notes;
      data.post.c = markNotes.setMark(data.post.c, notes.map(note => note.toObject()));
      // <- 把笔记标记在文中
      const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      data.type = (thread.oc === data.post.pid)? "modifyThread": "modifyPost";
      const firstPost = await thread.extendFirstPost();
      let parentPostCount;
      if(data.post.parentPostId) {
        parentPostCount = await db.PostModel.countDocuments({pid: data.post.parentPostId});
      }
      data.thread = {
        tid: thread.tid,
        title: firstPost.t,
        url: `/t/${thread.tid}`,
        comment: !!parentPostCount,
        oc: thread.oc, // 所属文章
        pid: data.post.pid, // 当前回复
        parentPostId: data.post.parentPostId // 父级postID
      };
      // post.type === post && post.parentPostId === "" && post.type === thread
      // 修改文章
      // post.type === post && post.parentPostId
      // 修改评论
      // post.type === post && post.parentPostId === ""
      // 修改回复
      selectedForumsId = thread.mainForumsId || [];
    }  */
    else if (type === draftDesType.newComment) {
      data.post = await db.PostModel.findOnly({pid: id});
      let notes = (await db.NoteModel.getNotesByPost(data.post)).notes;
      data.post.c = markNotes.setMark(data.post.c, notes.map(note => note.toObject()));
      // <- 把笔记标记在文中
      const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      const firstPost = await thread.extendFirstPost();
      data.thread = {
        tid: thread.tid,
        title: firstPost.t,
        url: `/t/${thread.tid}`,
        comment: true,
        oc: thread.oc, // 所属文章
        pid: data.post.pid, // 当前回复
        // parentPostId: data.post.parentPostId // 父级postID
      };
      data.type = 'newComment';
    }
    else if (type === draftDesType.modifyPost) {
      data.post = await db.PostModel.findOnly({pid: id});
      let notes = (await db.NoteModel.getNotesByPost(data.post)).notes;
      data.post.c = markNotes.setMark(data.post.c, notes.map(note => note.toObject()));
      // <- 把笔记标记在文中
      const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      const firstPost = await thread.extendFirstPost();
      data.thread = {
        tid: thread.tid,
        title: firstPost.t,
        url: `/t/${thread.tid}`,
        // comment: !!parentPostCount,
        oc: thread.oc, // 所属文章
        pid: data.post.pid, // 当前回复
        // parentPostId: data.post.parentPostId // 父级postID
      };
      data.type = 'modifyPost';
    } else if (type === draftDesType.modifyThread) {
      data.post = await db.PostModel.findOnly({pid: id});
      let notes = (await db.NoteModel.getNotesByPost(data.post)).notes;
      data.post.c = markNotes.setMark(data.post.c, notes.map(note => note.toObject()));
      // <- 把笔记标记在文中
      const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      const firstPost = await thread.extendFirstPost();
      data.thread = {
        tid: thread.tid,
        title: firstPost.t,
        url: `/t/${thread.tid}`,
        oc: thread.oc, // 所属文章
        // pid: data.post.pid, // 当前回复
        // parentPostId: data.post.parentPostId // 父级postID
      };
      data.type = 'modifyThread';
    } else if (type === draftDesType.modifyComment) {
      data.post = await db.PostModel.findOnly({pid: id});
      let notes = (await db.NoteModel.getNotesByPost(data.post)).notes;
      data.post.c = markNotes.setMark(data.post.c, notes.map(note => note.toObject()));
      // <- 把笔记标记在文中
      const thread = await db.ThreadModel.findOnly({tid: data.post.tid});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      const firstPost = await thread.extendFirstPost();
      data.thread = {
        title: firstPost.t,
        url: `/t/${thread.tid}`,
        tid: thread.tid,
        oc: thread.oc, // 所属文章
        pid: data.post.pid, // 当前回复
        comment: true,
        parentPostId: data.post.parentPostId // 父级postID
      };
      data.type = 'modifyComment';
    }
    else if(type === "redit") { // 从草稿箱来
      let {id, o, _id} = query;
      // 社区的草稿只能使用_id 才能具体查找到一篇文章
      let draft
      if(_id){
        draft = await db.DraftModel.findOne({_id, uid: user.uid});
      }else{
        draft = await db.DraftModel.findOne({did: id, uid: user.uid});
      }
      if(!draft) ctx.throw(400, "草稿不存在或已被删除");
      draft = draft.toObject();
      if(!['copy', 'update'].includes(o)) {
        o = 'update';
      }
      const {
        mainForumsId, categoriesId, desType, desTypeId, parentPostId
      } = draft;
      // 更新原有内容
      if(o === 'update') {
        data.draftId = draft.did;
        data.post = draft;
        selectedForumsId = mainForumsId;
        selectedCategoriesId = categoriesId;
      } else {
        // 复制为新文章
        data.post = {
          t: draft.t,
          c: draft.c,
          l: draft.l,
          abstractCn: '',
          abstractEn: '',
          keyWordsCn: [],
          keyWordsEn: [],
          authorInfos: [],
          mainForumsId: [],
          categoriesId: []
        }
      }
      // if(desType === "forum" || o === 'copy') { // 发表新帖
      if(desType === draftDesType.newThread || o === 'copy') { // 发表新帖
        data.type = "newThread";
      // } else if(desType === "thread") { // 发表新回复
      } else if(desType === draftDesType.newPost) { // 发表新回复
        data.type = "newPost";
        const thread = await db.ThreadModel.findOnly({tid: desTypeId});
        // 验证用户是否有权限查看文章
        const firstPost = await thread.extendFirstPost();
        data.thread = {
          tid: thread.tid,
          title: firstPost.t,
          url: `/t/${thread.tid}`,
        };
        selectedForumsId = thread.mainForumsId;
      }
      else if (desType === draftDesType.newComment) {
        const thread = await db.ThreadModel.findOnly({tid: desTypeId});
        // 验证用户是否有权限查看文章
        const firstPost = await thread.extendFirstPost();
        data.thread = {
          tid: thread.tid,
          title: firstPost.t,
          url: `/t/${thread.tid}`,
          comment: true
        };
        data.type = "newComment";

      }
      else if (desType === draftDesType.modifyThread) {
        const post = await db.PostModel.findOnly({pid: desTypeId});
        const thread = await db.ThreadModel.findOnly({tid: post.tid});
        // data.type = post.pid === thread.oc? "modifyThread": "modifyPost";
        const firstPost = await thread.extendFirstPost();
        data.post.pid = post.pid;
        data.thread = {
          tid: thread.tid,
          title: firstPost.t,
          url: `/t/${thread.tid}`,
        };
        data.type = 'modifyThread'
      }
      else if (desType === draftDesType.modifyPost) {
        const post = await db.PostModel.findOnly({pid: desTypeId});
        const thread = await db.ThreadModel.findOnly({tid: post.tid});
        const firstPost = await thread.extendFirstPost();
        data.post.pid = post.pid;
        data.thread = {
          tid: thread.tid,
          title: firstPost.t,
          url: `/t/${thread.tid}`,
        };
        data.type = 'modifyPost'

      }
      else if (desType === draftDesType.modifyComment) {
        const post = await db.PostModel.findOnly({pid: desTypeId});
        const thread = await db.ThreadModel.findOnly({tid: post.tid});
        const firstPost = await thread.extendFirstPost();
        data.post.pid = post.pid;
        data.thread = {
          tid: thread.tid,
          title: firstPost.t,
          url: `/t/${thread.tid}`,
          comment: true
        };
        data.type = 'modifyComment'

      }
      // else if(desType === "post") { // 编辑文章或编辑回复
      //   const post = await db.PostModel.findOnly({pid: desTypeId});
      //   const thread = await db.ThreadModel.findOnly({tid: post.tid});
      //   data.type = post.pid === thread.oc? "modifyThread": "modifyPost";
      //   const firstPost = await thread.extendFirstPost();
      //   let parentPost;
      //   if(parentPostId) {
      //     parentPost = await db.PostModel.findOne({pid: parentPostId});
      //   }
      //   data.post.pid = post.pid;
      //   data.thread = {
      //     tid: thread.tid,
      //     title: firstPost.t,
      //     url: `/t/${thread.tid}`,
      //     comment: !!parentPost
      //   };
      //   selectedForumsId = thread.mainForumsId;
      // // } else if(desType === "forumDeclare") { // 专业说明
      // //   data.type = "modifyForumDeclare";
      // //   const forum = await db.ForumModel.findOnly({fid: desTypeId});
      // //   data.forum = {
      // //     fid: forum.fid,
      // //     title: forum.displayName,
      // //     url: `/f/${forum.fid}`
      // //   };
      // }
      else {
        ctx.throw(400, `未知的草稿类型：${desType}`);
      }
    }
    // 拓展专业信息
    data.mainForums = [];
    if(selectedForumsId.length) {
      let forums_ = await db.ForumModel.find({fid: {$in: selectedForumsId}});
      const forumsObj_ = {};
      for(const f of forums_) {
        forumsObj_[f.fid] = f;
      }
      forums_ = [];
      for(const fid_ of selectedForumsId) {
        const f = forumsObj_[fid_];
        if(!f) continue;
        forums_.push(f);
      }
      const forums = [];
      for(const f of forums_) {
        const childForumsId = [] || await f.getAllChildForumsId();
        if(!childForumsId.length) forums.push(f);
      }
      const categories = await db.ThreadTypeModel.find({fid: {$in: forums.map(f => f.fid)}}).sort({order: 1});
      const categoriesObj = {};
      const selectedCategoriesObj = {};
      const cfObj = {};
      for(const c of categories) {
        categoriesObj[c.cid] = c;
        if(!cfObj[c.fid]) cfObj[c.fid] = [];
        cfObj[c.fid].push(c);
        if(selectedCategoriesId.includes(c.cid)) {
          selectedCategoriesObj[c.fid] = c;
        }
      }
      for(const forum of forums) {
        const category = selectedCategoriesObj[forum.fid];
        const f = forum.toObject();
        f.threadTypes = cfObj[f.fid] || [];
        data.mainForums.push({
          forum: f,
          fid: forum.fid,
          cid: category? category.cid: null,
          description: forum.description,
          color: forum.color,
          logo: forum.logo,
          banner: forum.banner,
          fName: forum.displayName,
          cName: category? category.name: ""
        });
      }
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
    if(["modifyPost", "modifyThread", "newPost"].includes(data.type) && data.userColumn) {
      data.addedToColumn = (await db.ColumnPostModel.countDocuments({columnId: data.userColumn._id, type: "thread", tid: data.thread.tid})) > 0;
    }
    // 判断用户是否是在专栏主页点击了「我要投稿」
    if(data.userColumn && query.toColumn === 'true' && data.type === 'newThread') {
      data.toColumn = true;
    }
    if(["modifyThread", "newThread"].includes(data.type)) {
      // 判断用户是否有权限发起调查
      data.createSurveyPermission = await db.SurveyModel.ensureCreatePermission("postToForum", data.user.uid);
      // 获取发表设置中原创申明文章内容最小字数限制
      const postSettings = await db.SettingModel.getSettings("post");
      data.originalWordLimit = postSettings.postToForum.originalWordLimit;
      data.minorForumCount = postSettings.postToForum.minorForumCount;
    }

    if(data.type === "newThread") {
      try{
        await db.UserModel.ensurePostThreadPermission(user.uid);
      } catch(err) {
        data.permissionInfo = `你暂无法发表内容，因为${err.message}。`;
      }
    }

    // 编辑器上边有关权限的提示
    if(data.type === 'newPost') {
      data.postPermission = await db.UserModel.getPostPermission(state.uid, 'post', selectedForumsId);
    } else if(data.type === 'newThread') {
      data.postPermission = await db.UserModel.getPostPermission(state.uid, 'thread', []);
    }

    data.post = data.post || {};
    state.editorSettings = await db.SettingModel.getSettings("editor");
    data.state = state;
    // 多维分类
    data.threadCategories = await db.ThreadCategoryModel.getCategoryTree({disabled: false});
    await next();
  })
  ;

module.exports = router;
