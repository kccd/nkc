module.exports = async (ctx, next) => {
  const {data, db, query, nkcModules} = ctx;
  const {targetUser} = data;
  const {page = 0} = query;
  const count = await db.DraftModel.count({uid: targetUser.uid});
  const paging = nkcModules.apiFunction.paging(page, count);
  const drafts = await db.DraftModel.find({uid: targetUser.uid}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  data.paging = paging;
  data.drafts = [];
  for(const draft of drafts) {
    const {desType, desTypeId} = draft;
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
      d.type = "modifyForumDeclare";
      const forum = await db.ForumModel.findOne({fid: desTypeId});
      if(!forum) continue;
      d.forum = {
        title: forum.displayName,
        url: `/f/${forum.fid}`
      };
    }
    d.c = nkcModules.apiFunction.obtainPureText(d.c, true, 300);
    data.drafts.push(d);
  }

  ctx.template = "user/profile/profile.pug";
  await next();
};