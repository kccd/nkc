// 两个要比较的草稿
// function getLatestDrafts () {

// }

//获取用户的草稿
module.exports = async (ctx, next) => {
  const {data, db, query, nkcModules} = ctx;
  const {targetUser} = data;
  const {page = 0, perpage = 30, type } = query;
  let count, paging, drafts;
  const thread = (await db.DraftModel.getDesType()).thread;
  const beta = (await db.DraftModel.getType()).beta;
  const forum = (await db.DraftModel.getDesType()).forum;  
  const post = (await db.DraftModel.getDesType()).post;  
  // 如果是社区内容草稿
  if(type === 'community') {
    count = await db.DraftModel.countDocuments({uid: targetUser.uid, type: beta});
    paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
    drafts = await db.DraftModel.find({uid: targetUser.uid, type: beta})
      // .sort({toc: -1})
      .sort({tlm: -1})
      .skip(paging.start).limit(paging.perpage);
  } else if (type === 'newThread') {
    // 如果打开编辑器文章，显示文章
    // 文章有两种类型
      // forum  新文章
      // post 可能是修改文章
    // newThread 等于 forum
    /* count = await db.DraftModel.countDocuments({uid: targetUser.uid, desType: forum});
    paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
    const draftData = await db.DraftModel.find({uid: targetUser.uid, desType: forum, type: beta})
      // .sort({toc: -1})
      .sort({tlm: -1})
      .skip(paging.start)
      .limit(paging.perpage); */
    const threadData = await db.DraftModel.getLatestThread(targetUser.uid, nkcModules);
    drafts = threadData ? [threadData] : [];
  } else if (type === 'newPost') {
    // 需要显示当前文章下的回复草稿
    //回复有两种类型
      // thread  新回复
      // post 可能是修改的回复
    const { desTypeId } = query;
    if(!desTypeId) ctx.throw(400, 'desTypeId不存在');
    // 把desTypeId拿去thread表中查询    
    // count = await db.DraftModel.countDocuments({uid: targetUser.uid, desType: {$in: [thread]}});
    // paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
    // const draftData = await db.DraftModel.find({ uid: targetUser.uid, desType: thread, type: beta, desTypeId, parentPostId: "" })
    //   // .sort({toc: -1})
    //   .sort({tlm: -1})
    //   .skip(paging.start)
    //   .limit(paging.perpage);
    const postData = await db.DraftModel.getLatestPost(desTypeId, targetUser.uid, nkcModules);

    drafts = postData ? [postData] : [];
    
    // 从post 和 thread中各取一个最近修改时间进行对比，找出最近修改回复
    // if(!postData) {
    //   drafts = draftData;
    // } else if (!draftData[0]) {
    //   drafts = [postData];
    // } else if (postData && draftData[0]) {
    //   if (postData.tlm.getTime() >  draftData[0].tlm.getTime()) {
    //     drafts = [postData];
    //   } else {
    //     drafts = draftData
    //   } 
    // } else {
    //   drafts = []
    // }
  } else if (type === 'modifyThread') {
    // 修改回复或修改文章
    // count = await db.DraftModel.countDocuments({uid: targetUser.uid, desType: forum});
    // paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
    // const draftData = await db.DraftModel.find({uid: targetUser.uid, desType: forum, type: beta})
    // // .sort({toc: -1})
    //   .sort({tlm: -1})
    //   .skip(paging.start)
    //   .limit(paging.perpage);
    const threadData = await db.DraftModel.getLatestThread(targetUser.uid, nkcModules);
    drafts = threadData ? [threadData] : [];
  } else if (type === 'modifyPost') {
    const { desTypeId, comment } = query;
    if(!desTypeId) ctx.throw(400, 'desTypeId不存在');
    // 获取文章评论
    if (comment) {
      count = await db.DraftModel.countDocuments({uid: targetUser.uid, desType: {$in: [thread]}});
      paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
      const draftData = await db.DraftModel.find({ uid: targetUser.uid, desType: {$in: [thread, post]}, type: beta, parentPostId: desTypeId }).sort({tlm: -1});
      drafts = draftData;
    } else {
      
      // count = await db.DraftModel.countDocuments({uid: targetUser.uid, desType: {$in: [thread]}});
      // paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
      // const draftData = await db.DraftModel.find({ uid: targetUser.uid, desType: thread, type: beta, desTypeId, parentPostId: ""  })
      //   // .sort({toc: -1})
      //   .sort({tlm: -1})
      //   .skip(paging.start)
      //   .limit(paging.perpage);
      const postData = await db.DraftModel.getLatestPost(desTypeId, targetUser.uid, nkcModules);
      drafts = postData ? [postData] : [];

      // 从post 和 thread中各取一个最近修改时间进行对比，找出最近修改回复
      // if(!postData) {
      //   drafts = draftData;
      // } else if (!draftData[0]) {
      //   drafts = [postData];
      // } else if (postData && draftData[0]) {
      //   if (postData.tlm.getTime() >  draftData[0].tlm.getTime()) {
      //     drafts = [postData];
      //   } else {
      //     drafts = draftData
      //   } 
      // } else {
      //   drafts = []
      // }
    }     
  } else {
    count = await db.DraftModel.countDocuments({uid: targetUser.uid});
    paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
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
  await next();
}
