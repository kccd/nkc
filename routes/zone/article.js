const router = require('koa-router')();
router
  .get('/:aid', async (ctx, next) => {
    ctx.template = 'zone/article.pug'
    const { db, data, params, query, state, permission, nkcModules } = ctx;
    const { aid } = params;
    const {pageSettings} = state;
    const {user} = data;
    const {page = 0, last_pages, highlight, t} = query;
    const {normal: commentStatus, default: defaultComment} = await db.CommentModel.getCommentStatus();
    // 获取空间文章需要显示的数据
    const articleRelatedContent = await db.ArticleModel.getZoneArticle(aid);
    data.columnPost = articleRelatedContent;
    let article = await db.ArticleModel.findOnly({_id: aid});
    data.article = article;
    const isModerator = await article.isModerator(state.uid);
    //获取当前文章信息
    article = await db.ArticleModel.extendDocumentsOfArticles([article], 'stable', [
      '_id',
      'uid',
      'status'
    ]);
    const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
    if(article[0].document.status !== normalStatus && !isModerator) {
      if(!permission('review')) {
          return ctx.throw(403, '权限不足');
      }
    }
    let match = {
    };
    //只看作者
    if(t === 'author') {
      data.t = t;
      match.uid = article[0].uid;
    }
    const permissions = {
    };
    if(user) {
      if(permission('review')) {
          permissions.reviewed = true;
      } else {
        match.status = commentStatus;
      }
      //禁用和退修权限
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
          permissions.disabled = true
      }
    }
    const count = await db.CommentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
    data.paging = paging;
    //获取该文章下当前用户编辑了未发布的评论内容
    const m = {
      uid: state.uid,
      status: defaultComment,
    };
    let comment = await db.CommentModel.getCommentsByArticleId({match: m, source: article[0].source, aid: article[0]._id,});
    //获取该文章下的评论
    let comments = await db.CommentModel.getCommentsByArticleId({match, paging, source: article[0].source, aid: article[0]._id,});
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
    data.articleStatus = article[0].document.status;
    const hidePostSettings = await db.SettingModel.getSettings("hidePost");
    data.postHeight = hidePostSettings.postHeight;
    data.permissions = permissions;
    data.isModerator =  isModerator;
    data.comments = comments || [];
    data.type = 'article';
    await next();
  });
module.exports = router;
