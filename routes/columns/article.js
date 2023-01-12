const router = require('koa-router')();

router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query, state, permission} = ctx;
  const {highlight, t, last_page, token} = query;
  let {page = 0} = query;
  // ctx.template = 'columns/article.pug';
  ctx.remoteTemplate = 'columns/article.pug';
  const { user } = data;
  const {_id, aid} = params;
  data.highlight = highlight;
  let xsf = user ? user.xsf : 0;
  let columnPostData = await db.ColumnPostModel.getDataRequiredForArticle(_id, aid, xsf);
  // 简化设置发表目标用户信息
  data.targetUser = {
    uid: columnPostData.user.uid,
    username: columnPostData.user.username
  };
  data.targetUser.avatar = nkcModules.tools.getUrl('userAvatar', columnPostData.user.avatar);
  data.columnPost = columnPostData;
  data.columnPost.collected = false;
  data.authorAccountRegisterInfo = await db.UserModel.getAccountRegisterInfo({
    uid: columnPostData.column.uid
  });
  const {article, thread} = await db.ColumnPostModel.getColumnPostTypes();
  const homeSettings = await db.SettingModel.getSettings("home");
  let isModerator;
  if(columnPostData.type === article) {
    //获取文章的评论信息
    const {normal: commentStatus, default: defaultComment} = await db.CommentModel.getCommentStatus();
    const _article = columnPostData.article;
    const article = await db.ArticleModel.findOnly({_id: _article._id});
    const categoriesObj = await db.ThreadCategoryModel.getCategories(article.tcId, 'article');
    data.allCategories = categoriesObj.allCategories;
    data.categoryList = categoriesObj.categoryList;
    data.categoriesTree = categoriesObj.categoriesTree;
    // 验证权限 - new
    // 如果是分享出去的连接，含有token，则允许直接访问
    // 【待改】判断用户是否是通过分享链接阅读文章，如果是则越过权限
    if(token) {
      //如果存在token就验证token是否合法
      await db.ShareModel.hasPermission(token, _article._id)
    }
    const userColumn = await db.UserModel.getUserColumn(state.uid)
    if(userColumn) {
      data.addedToColumn = (await db.ColumnPostModel.countDocuments({columnId: userColumn._id, type: "article", pid: article._id})) > 0;
    }
    const columnPermission = await db.UserModel.ensureApplyColumnPermission(data.user);
    data.columnInfo = {
      userColumn: userColumn,
      columnPermission: columnPermission,
      column: userColumn,
    };
    data.columnPost.article.vote = await db.PostsVoteModel.getVoteByUid({uid: state.uid, id: data.columnPost.article._id, type: 'article'});
    const articlePost = await db.ArticlePostModel.findOne({sid: article._id, source: article.source});
    isModerator = await article.isModerator(state.uid);
    data.homeTopped = await db.SettingModel.isEqualOfArr(homeSettings.toppedThreadsId, {id: article._id, type: 'article'});
    const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
    if(_article.status !== normalStatus && !isModerator) {
      if(!permission('review')) {
        return ctx.throw(403, '权限不足');
      }
    }
    let match = {
    };
    if(articlePost) {
      match.sid = articlePost._id;
    }
    //只看作者
    if(t === 'author') {
      data.t = t;
      match.uid = _article.uid;
    }
    const permissions = {
      cancelXsf: ctx.permission('cancelXsf'),
      modifyKcbRecordReason: ctx.permission('modifyKcbRecordReason'),
      manageZoneArticleCategory: ctx.permission('manageZoneArticleCategory'),
      showManagement: ctx.permissionsOr(['pushThread', 'moveThreads', 'movePostsToDraft', 'movePostsToRecycle', 'digestThread', 'unDigestThread', 'toppedThread', 'unToppedThread', 'homeTop', 'unHomeTop']),
      creditKcb: ctx.permission('creditKcb'),
      unblockPosts: ctx.permission('unblockPosts'),
      review: ctx.permission('review'),
      homeHotColumn: ctx.permission('homeHotColumn'),
      homeToppedColumn: ctx.permission('homeToppedColumn'),
      column_single_disabled: ctx.permission('column_single_disabled'),
    };
    //文章收藏数
    data.columnPost.collectedCount = await db.ArticleModel.getCollectedCountByAid(article._id);
    if(user) {
      //用户是否是作者
      if(permission('review')) {
        permissions.reviewed = true;
      } else {
        // match.$or = [
        //   {status: commentStatus},
        //   {uid}
        // ];
      }
      //是否收藏文章
      const collection = await db.SubscribeModel.findOne({cancel: false, uid: data.user.uid, tid: article._id, type: "article"});
      if(collection) {
        data.columnPost.collected = true;
      }
      //禁用和退修权限
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.disabled = true
      }
    }
    //获取评论分页
    let count = 0;
    if(articlePost) {
      // 获取当前文章下回复的总数目
      count = await db.CommentModel.countDocuments(match);
    }
    const paging_ = nkcModules.apiFunction.paging(page, count, 30);
    const {pageCount} = paging_;
    // 访问最后一页
    if(last_page) {
      page = pageCount -1;
    }
    const paging = nkcModules.apiFunction.paging(page, count, 30);
    data.paging = paging;
    //获取该文章下当前用户编辑了未发布的评论内容 必须通过专栏评论盒子去查找评论，如果没有评论盒子评论就为空
    let comment = null;
    let comments = [];
    //获取该文章下的评论 存在评论盒子时才查找当前文章下的评论
    if(articlePost) {
      const m = {
        uid: state.uid,
        status: defaultComment,
        sid: articlePost._id
      };
      comment = await db.CommentModel.getCommentsByArticleId({match: m});
      //查找出文章下的所有评论
      comments = await db.CommentModel.getCommentsByArticleId({match, paging});
    }
    if(comments && comments.length !== 0) {
      comments = await db.CommentModel.extendPostComments({comments, uid: state.uid, isModerator, permissions, authorUid:article.uid});
    }
    if(comment && comment.length !== 0) {
      //拓展单个评论内容
      comment = await comment[0].extendEditorComment();
      if(comment.type === 'beta') {
        data.comment = comment || '';
      }
    }
    data.article = _article;
    data.permissions = permissions;
    data.originUrl = state.url;//楼号a标签的href固定值+xxx
    data.comments = comments || [];
    //文章浏览数加一
    await article.addArticleHits();
  } else if(columnPostData.type === thread) {
    data.permissions = {
      cancelXsf: ctx.permission('cancelXsf'),
      modifyKcbRecordReason: ctx.permission('modifyKcbRecordReason'),
    };
    //获取论坛文章的评论
    const thread = await db.ThreadModel.findOnly({tid: columnPostData.thread.tid});
    //
    if(!thread) ctx.throw(400, '未找到文章，请刷新');
    // 专业权限判断
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    //判断用户是否具有专家权限
    isModerator = await db.ForumModel.isModerator(state.uid, thread.mainForumsId);
    //文章收藏数
    data.columnPost.collectedCount = await db.ThreadModel.getCollectedCountByTid(thread.tid);
    //获取用户是否收藏文章
    if(user) {
      const collection = await db.SubscribeModel.findOne({cancel: false, uid: data.user.uid, tid: thread.tid, type: "collection"});
      if(collection) {
        data.columnPost.collected = true;
      }
    }
    // 文章处于待审核的状态
    // 若当前用户不是专家、不是作者，则在此抛出403
    if(!thread.reviewed) {
      if(!data.user || (!isModerator && data.user.uid !== thread.uid)) ctx.throw(403, "文章还未通过审核，暂无法阅读");
    }
    // 文章处于已被退回的状态
    if(thread.recycleMark) {
      // 用户不具有专家权限
      if(!isModerator) {
        // 访问用户没有查看被退回文章的权限，且不是自己发表的文章则抛出403
        if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
          if(!data.user || thread.uid !== data.user.uid) ctx.throw(403, '文章已被退回修改，暂无法阅读。');
        }
      }
      // 获取文章被退回的原因
      const threadLogOne = await db.DelPostLogModel.findOne({"threadId":thread.tid,"postType":"thread","delType":"toDraft","modifyType":false}).sort({toc: -1});
      thread.reason = threadLogOne.reason || '';
    }
    //文章回复查询规则 只查询状态正常的回复
    const match = {
      tid: thread.tid,
      type: 'post',
      parentPostsId: {
        $size: 0
      },
      reviewed: true,
      disabled: false,
      toDraft: {$ne: true},
    };
    //获取分页设置
    const {pageSettings} = state;
    //获取当前文章下的回复总数
    const count = await db.PostModel.countDocuments(match);
    //获取文章下的所有回复
    const paging = nkcModules.apiFunction.paging(page, count, pageSettings.threadPostList)
    data.paging = paging;
    let posts = await db.PostModel.find(match).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
    const options = {
      uid: data.user?data.user.uid:'',
      visitor: data.user,
    };
    //拓展专栏的文章回复
    posts = await db.PostModel.extendPostsByColumn(posts, options);
    data.columnPost.posts  = posts;
    // 文章的置顶回复
    const toppedPostsId = thread.toppedPostsId;
    const toppedPostMatch = {... match};
    toppedPostMatch.pid = {$in: toppedPostsId};
    const toppedPostsRandom = await db.PostModel.find(match);
    let toppedPosts = [];
    for(const post of toppedPostsRandom) {
      const index = toppedPostsId.indexOf(post.pid);
      if(index === -1) continue;
      toppedPosts[index] = post;
    }
    toppedPosts = toppedPosts.filter(post => !!post);
    toppedPosts = await db.PostModel.extendPostsByColumn(toppedPosts, options);
    data.columnPost.toppedPosts = toppedPosts;
    // 文章访问量加1
    await thread.updateOne({$inc: {hits: 1}});
  } else {
    return;
  }
  if(isModerator) {
    data.isModerator =  isModerator;
  }
  const hidePostSettings = await db.SettingModel.getSettings("hidePost");
  data.postHeight = hidePostSettings.postHeight;
  await next();
})
module.exports = router;
