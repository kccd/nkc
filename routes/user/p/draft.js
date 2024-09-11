// 两个要比较的草稿
// function getLatestDrafts () {

// }

//获取用户的草稿
module.exports = async (ctx, next) => {
  const {data, db, query, nkcModules} = ctx;
  const {targetUser} = data;
  let {page = 0, perpage = 30, type } = query;
  page = Number(page);
  perpage = Number(perpage);
  let count, paging, drafts;
  const draftDesType = await db.DraftModel.getDesType();
  const beta = (await db.DraftModel.getType()).beta;
  // 如果是社区内容草稿
  if(type === 'community') {
    count = await db.DraftModel.countDocuments({uid: targetUser.uid, type: beta});
    paging = nkcModules.apiFunction.paging(page, count, perpage);
    drafts = await db.DraftModel.find({uid: targetUser.uid, type: beta})
      // .sort({toc: -1})
      .sort({tlm: -1})
      .skip(paging.start)
      .limit(paging.perpage);
  } else if (type === 'newThread') {
    if (perpage > 1) perpage = 1;
    const threadData = await db.DraftModel.getLatestNewThread(targetUser.uid, perpage);
    // drafts = threadData ? [threadData] : [];
    drafts = threadData || [];
  } else if (type === 'newPost') {
    // 获取最近的新回复
    const { desTypeId } = query;
    if(!desTypeId) ctx.throw(400, 'desTypeId不存在');
    if (perpage > 1) perpage = 1;
    const postData = await db.DraftModel.getLatestNewPost(desTypeId, targetUser.uid, perpage);
    drafts = postData || [];
    
  } else if (type === 'modifyThread') {
    // 获取最近的修改文章
    const { desTypeId } = query;
    if(!desTypeId) ctx.throw(400, 'desTypeId不存在');
    if (perpage > 1) perpage = 1;
    const threadData = await db.DraftModel.getLatestModifyThread(desTypeId, targetUser.uid, perpage);
    // drafts = threadData ? [threadData] : [];
    drafts = threadData || [];

  } else if (type === 'modifyPost') {
    const { desTypeId } = query;
    if(!desTypeId) ctx.throw(400, 'desTypeId不存在');
    if (perpage > 1) perpage = 1;
    const postData = await db.DraftModel.getLatestModifyPost(desTypeId, targetUser.uid, perpage);
    // drafts = postData ? [postData] : [];
    drafts = postData || [];

  } else if (type === 'modifyComment') {
    const { desTypeId } = query;
    if(!desTypeId) ctx.throw(400, 'desTypeId不存在');   
    if (perpage > 1) perpage = 1;

    const modifyComment = (await db.DraftModel.getDesType()).modifyComment;
    // count = await db.DraftModel.countDocuments({uid: targetUser.uid, desType: modifyComment});
    // paging = nkcModules.apiFunction.paging(page, count, perpage);
    const draftData = await db.DraftModel.find({ uid: targetUser.uid, desType: modifyComment, type: beta, desTypeId, parentPostId: { $ne: "" } })
      .sort({tlm: -1})
      .skip(page)
      .limit(perpage);
    drafts = draftData;

  } else if (type === 'newComment') {
    // 查询需要parentPostId
    const { desTypeId, parentPostId } = query;
    if (!desTypeId || !parentPostId) ctx.throw(400, '参数有误');
    if (perpage > 1) perpage = 1;
    const newComment = (await db.DraftModel.getDesType()).newComment;
    const draftData = await db.DraftModel.find({
      uid: targetUser.uid,
      desType: newComment,
      type: beta,
      desTypeId,
      parentPostId,
    })
      .sort({ tlm: -1 })
      .skip(page)
      .limit(perpage);
    drafts = draftData;
  } else {
    count = await db.DraftModel.countDocuments({uid: targetUser.uid});
    paging = nkcModules.apiFunction.paging(page, count, perpage);
    drafts = await db.DraftModel.find({uid: targetUser.uid})
      // .sort({toc: -1})
      .sort({tlm: -1})
      .skip(paging.start)
      .limit(paging.perpage);
  }
  data.paging = paging;
  data.drafts = [];
  for(const draft of drafts) {
    const {desType, desTypeId, mainForumsId, categoriesId} = draft;
    const d = draft.toObject();
    /* if(desType === draftDesType.newThread) {
      const thread = await db.ThreadModel.findOne({tid: desTypeId});
      if(!thread) continue;
      const firstPost = await db.PostModel.findOne({pid: thread.oc});
      d.thread = {
        url: `/t`,
        title: 1231
      };
      d.type = "newThread";
    } else */ 
    // 在草稿显示时提示此草稿属于那片文章并且返回url
    if(desType === draftDesType.newPost) {
      const thread = await db.ThreadModel.findOne({tid: desTypeId});
      if(!thread) continue;
      const firstPost = await db.PostModel.findOne({pid: thread.oc});
      d.thread = {
        url: `/t/${thread.tid}`,
        title: firstPost.t
      };
      // d.type = "newPost";

    } else if (desType === draftDesType.modifyThread) {
      const post = await db.PostModel.findOne({pid: desTypeId});
      if(!post) continue;
      const thread = await db.ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      // 草稿提示使用
      d.thread = {
        url: `/t/${thread.tid}`,
        title: post.t
      };
      // d.type = "modifyThread";

    } else if (desType === draftDesType.modifyComment) {
      const post = await db.PostModel.findOne({pid: desTypeId});
      if(!post) continue;
      const thread = await db.ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      const firstPost = await db.PostModel.findOne({pid: thread.oc});
      const url = await db.PostModel.getUrl(post.pid);
      d.thread = {
        url,
        title: firstPost.t
      };
      // d.type = "modifyComment";

    } else if (desType === draftDesType.modifyPost) {
      const post = await db.PostModel.findOne({pid: desTypeId});
      if(!post) continue;
      const thread = await db.ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      const firstPost = await db.PostModel.findOne({pid: thread.oc});
      const url = await db.PostModel.getUrl(post.pid);
      d.thread = {
        url,
        title: firstPost.t
      };
      // d.type = "modifyPost";
    } else if (desType === draftDesType.newComment) {
      const thread = await db.ThreadModel.findOne({tid: desTypeId});
      if(!thread) continue;
      const firstPost = await db.PostModel.findOne({pid: thread.oc});
      d.thread = {
        url: `/t/${thread.tid}`,
        title: firstPost.t
      };
    }
    
    /* else if(desType === "post") {
      const post = await db.PostModel.findOne({pid: desTypeId});
      if(!post) continue;
      const thread = await db.ThreadModel.findOne({tid: post.tid});
      if(!thread) continue;
      if(post.pid === thread.oc) {
        d.thread = {
          url: `/t/${thread.tid}`,
          title: post.t
        };
        d.type = "modifyThread";
      } else {
        const firstPost = await db.PostModel.findOne({pid: thread.oc});
        const url = await db.PostModel.getUrl(post.pid);
        d.thread = {
          url,
          title: firstPost.t
        };
        d.type = "modifyPost";
      }
    } */ 
    /* else {
      if(desType === 'forumDeclare') {
        d.type = "modifyForumDeclare";
      } else {
        d.type = "modifyForumLatestNotice";
      }
      const forum = await db.ForumModel.findOne({fid: desTypeId});
      if(!forum) continue;
      d.forum = {
        title: forum.displayName,
        url: `/f/${forum.fid}`
      };
    } */
    // 拓展专业信息
    d.mainForums = [];
    if(mainForumsId.length) {
      const forums = await db.ForumModel.find({fid: {$in: mainForumsId}});
      const categories = await db.ThreadTypeModel.find({cid: {$in: categoriesId}});
      const categoriesObj = {};
      for(const c of categories) {
        categoriesObj[c.fid] = c;
      }
      for(const forum of forums) {
        const category = categoriesObj[forum.fid];
        d.mainForums.push({
          fid: forum.fid,
          cid: category? category.cid: "",
          description: forum.description,
          iconFileName: forum.iconFileName,
          logo: forum.logo,
          banner: forum.banner,
          color: forum.color,
          fName: forum.displayName,
          cName: category? category.name: ""
        });
      }
    }
    d.content = d.c;
    d.c = nkcModules.apiFunction.obtainPureText(d.c, true, 300);
    data.drafts.push(d);
  }
  await next();
}
