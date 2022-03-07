const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query, state} = ctx;
  ctx.template = 'columns/article/article.pug';
  const {_id, aid} = params;
  // const category =  query
  let columnPost = await db.ColumnPostModel.getDataRequiredForArticle(_id, aid);
  const {article: articleSource} = await db.CommentModel.getCommentSources();
  const {article} = columnPost;
  const {_id: articleId} = article;
  //获取该文章下的评论
  let comments = await db.CommentModel.find({sid: articleId, source: articleSource});
  let comment = await db.CommentModel.findOne({uid: state.uid, source: articleSource, sid: articleId}).sort({toc: -1}).limit(1);
  comments = await db.CommentModel.extendPostComments({comments, uid: state.uid});
  if(comment ) {
    comment = await comment.extendEditorComment(comment);
    if(comment.type === 'beta') {
      data.comment = comment || '';
    }
  }
  data.columnPost = columnPost;
  data.comments = comments || [];
  await next();
})
module.exports = router;
