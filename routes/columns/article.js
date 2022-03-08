const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query, state} = ctx;
  const {pageSettings} = state;
  const {page = 0, last_page, highlight, t} = query;
  ctx.template = 'columns/article/article.pug';
  const {_id, aid} = params;
  // const category =  query
  let columnPost = await db.ColumnPostModel.getDataRequiredForArticle(_id, aid);
  const {article: articleSource} = await db.CommentModel.getCommentSources();
  let {_id: articleId} = columnPost.article.articleInfo;
  const _article = await db.ArticleModel.findOnly({_id: articleId});
  let match = {
    sid: articleId,
    source: articleSource
  };
  //只看作者
  if(t == 'author') {
    data.t = t;
    match.uid = _article.uid;
  }
  const count = await db.CommentModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
  data.paging = paging;
  //获取该文章下的评论
  let comments = await db.CommentModel.find(match)
    .skip(paging.start)
    .limit(paging.perpage);
  let comment = await db.CommentModel.findOne({uid: state.uid, source: articleSource, sid: articleId}).sort({toc: -1}).limit(1);
  comments = await db.CommentModel.extendPostComments({comments, uid: state.uid});
  if(comment ) {
    comment = await comment.extendEditorComment(comment);
    if(comment.type === 'beta') {
      data.comment = comment || '';
    }
  }
  const hidePostSettings = await db.SettingModel.getSettings("hidePost");
  const isModerator = await _article.isModerator(state.uid);
  data.isModerator =  isModerator;
  data.postHeight = hidePostSettings.postHeight;
  data.columnPost = columnPost;
  data.comments = comments || [];
  await next();
})
module.exports = router;
