module.exports = async (ctx, next) => {
  const {data, db, query, nkcModules} = ctx;
  const {targetUser} = data;
  const {page = 0, perpage = 30} = query;
  const count = await db.DraftModel.countDocuments({uid: targetUser.uid});
  const paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
  const drafts = await db.DraftModel.find({uid: targetUser.uid}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  data.paging = paging;
  data.drafts = [];
  for(const draft of drafts) {
    const {desType, desTypeId, mainForumsId, categoriesId} = draft;
    const d = draft.toObject();
    if(desType === "forum") {
      d.type = "newThread";
    } else if(desType === "thread") {
      d.type = "newPost";
      const thread = await db.ThreadModel.findOne({tid: desTypeId});
      if(!thread) continue;
      const firstPost = await db.PostModel.findOne({pid: thread.oc});
      d.thread = {
        url: `/t/${thread.tid}`,
        title: firstPost.t
      };
    } else if(desType === "post") {
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
    } else {
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
    }
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

  ctx.template = "user/profile/profile.pug";
  await next();
};
