const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query, state, permission} = ctx;
  const {pageSettings} = state;
  const {page = 0, last_page, highlight, t, test} = query;
  if(test) {
  ctx.template = 'columns/article/article.pug';
  } else {
    ctx.template = 'columns/article.pug';
  }
  const { user } = data;
  const {_id, aid} = params;
  let columnPost = await db.ColumnPostModel.getDataRequiredForArticle(_id, aid);
  const {article: articleSource} = await db.CommentModel.getCommentSources();
  const {normal: commentStatus, default: defaultComment} = await db.CommentModel.getCommentStatus();
  let {_id: articleId} = columnPost.article.articleInfo;
  const article = await db.ArticleModel.findOnly({_id: articleId});
  //文章阅读量加一
  await article.addArticleHits();
  const isModerator = await article.isModerator(state.uid);
  //获取当前文章信息
  // const _article = await db.ArticleModel.extendDocumentsOfArticles([article], 'stable', [
  //   '_id',
  //   'uid',
  //   'status',
  // ]);
  const _article = (await db.ArticleModel.getArticlesInfo([article]))[0];
  data.article = _article;
  //获取文章链接
  const baseUrl = _article.url;
  data.articleStatus = _article.document.status;
  const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
  if(_article.document.status !== normalStatus && !isModerator) {
    if(!permission('review')) {
      return ctx.throw(403, '权限不足');
    }
  }
  let match = {
  };
  //只看作者
  if(t === 'author') {
    data.t = t;
    match.uid = _article.uid;
  }
  const permissions = {
  };
  data.collectedCount = await db.ArticleModel.getCollectedCountByAid(article._id);
  data.collected = false
  if(user) {
    if(permission('review')) {
      permissions.reviewed = true;
    } else {
      match.status = commentStatus;
    }
    const collection = await db.SubscribeModel.findOne({cancel: false, uid: data.user.uid, tid: article._id, type: "article"});
    if(collection) {
      data.collected = true
    }
    //禁用和退修权限
    if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
      permissions.disabled = true
    }
  }
  // if(!isModerator || !permission("review")) {
  //   match.
  // }
  const count = await db.CommentModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
  data.paging = paging;
  //获取该文章下当前用户编辑了未发布的评论内容
  const m = {
    uid: state.uid,
    status: defaultComment,
  };
  let comment = await db.CommentModel.getCommentsByArticleId({match: m, source: _article.source, aid: _article._id,});
  //获取该文章下的评论
  let comments = await db.CommentModel.getCommentsByArticleId({match, paging, source: _article.source, aid: _article._id,});
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
  const hidePostSettings = await db.SettingModel.getSettings("hidePost");
  data.baseUrl = baseUrl;
  data.permissions = permissions;
  data.isModerator =  isModerator;
  data.postHeight = hidePostSettings.postHeight;
  data.columnPost = columnPost;
  data.comments = comments || [];
  await next();
})
module.exports = router;
