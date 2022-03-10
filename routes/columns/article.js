const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query, state, permission} = ctx;
  const {pageSettings} = state;
  const {user} = data;
  const {page = 0, last_page, highlight, t} = query;
  ctx.template = 'columns/article/article.pug';
  const {_id, aid} = params;
  // const category =  query
  let columnPost = await db.ColumnPostModel.getDataRequiredForArticle(_id, aid);
  const {article: articleSource} = await db.CommentModel.getCommentSources();
  const {normal: commentStatus, default: defaultComment} = await db.CommentModel.getCommentStatus();
  let {_id: articleId} = columnPost.article.articleInfo;
  let _article = await db.ArticleModel.findOnly({_id: articleId});
  const isModerator = await _article.isModerator(state.uid);
  //获取当前文章信息
  _article = await db.ArticleModel.extendDocumentsOfArticles([_article], 'stable', [
    '_id',
    'uid',
    'status'
  ]);
  data.articleStatus = _article[0].document.status;
  const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
  if(_article[0].document.status !== normalStatus && !isModerator) {
    if(!permission('review')) {
      return ctx.throw(403, '权限不足');
    }
  }
  let match = {
    status: commentStatus,
  };
  //只看作者
  if(t === 'author') {
    data.t = t;
    match.uid = _article[0].uid;
  }
  const permissions = {
  };
  if(user) {
    if(permission('review')) {
      permissions.reviewed = true;
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
  let comment = await db.CommentModel.getCommentsByArticleId({match: m, source: _article[0].source, aid: _article[0]._id,});
  //获取该文章下的评论
  let comments = await db.CommentModel.getCommentsByArticleId({match, paging, source: _article[0].source, aid: _article[0]._id,});
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
  data.permissions = permissions;
  data.isModerator =  isModerator;
  data.postHeight = hidePostSettings.postHeight;
  data.columnPost = columnPost;
  data.comments = comments || [];
  await next();
})
module.exports = router;
