const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query, state, permission} = ctx;
  const {pageSettings} = state;
  const {page = 0, last_page, highlight, t, test} = query;
  ctx.template = 'columns/article.pug';
  const { user } = data;
  const {_id, aid} = params;
  let columnPostData = await db.ColumnPostModel.getDataRequiredForArticle(_id, aid, user.xsf);
  data.columnPost = columnPostData;
  data.columnPost.collected = false;
  const {article, thread} = await db.ColumnPostModel.getColumnPostTypes();
  let isModerator;
  if(columnPostData.type === article) {
    //获取文章的评论信息
    const {normal: commentStatus, default: defaultComment} = await db.CommentModel.getCommentStatus();
    const _article = columnPostData.article;
    const article = await db.ArticleModel.findOnly({_id: _article._id});
    const articlePost = await db.ArticlePostModel.findOne({sid: article._id, source: article.source});
    isModerator = await article.isModerator(state.uid);
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
    };
    //文章收藏数
    data.columnPost.collectedCount = await db.ArticleModel.getCollectedCountByAid(article._id);
    if(user) {
      //用户是否是作者
      if(permission('review')) {
        permissions.reviewed = true;
      } else {
        match.status = commentStatus;
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
      count = await db.CommentModel.countDocuments(match);
    }
    const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
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
      comments = await db.CommentModel.getCommentsByArticleId({match, paging});
    }
    if(comments && comments.length !== 0) {
      comments = await db.CommentModel.extendPostComments({comments, uid: state.uid, isModerator, permissions});
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
    data.comments = comments || [];
    //文章浏览数加一
    await article.addArticleHits();
  } else if(columnPostData.type === thread) {
    //获取论坛文章的评论
    const thread = await db.ThreadModel.findOnly({tid: columnPostData.thread.tid});
    //
    if(!thread) ctx.throw(400, '未找到文章，请刷洗');
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
    //加载回复
    let posts = await db.PostModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const options = {
      uid: data.user?data.user.uid:'',
      visitor: data.user,
    };
    //拓展专栏的文章回复
    posts = await db.PostModel.extendPostsByColumn(posts, options);
    data.columnPost.posts  = posts;
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
