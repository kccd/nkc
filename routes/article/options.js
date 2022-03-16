const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
      const {db, data, params, query, state, permission} = ctx;
      const {aid} = params;
      const {user} = data;
      const {uid} = state;
      const {normal: articleStatus} = await db.ArticleModel.getArticleStatus();
      let article = await db.ArticleModel.findOnly({_id: aid});
      if(!article) ctx.throw(404, '未找到文章，请刷新后重试');
      article = (await db.ArticleModel.getArticlesInfo([article]))[0];
      data.article = article;
      const {stable: stableType} = await db.DocumentModel.getDocumentTypes();
      const {normal: normalStatus} = await db.DocumentModel.getDocumentStatus();
      const {article: articleSource} = await db.DocumentModel.getDocumentSources();
      const document = await db.DocumentModel.findOnly({did: article.did, type: stableType, source: articleSource});
      if(!document) return ctx.throw(404, '未找到文章，请刷新后重试');
      if(!permission('review')) {
        if(document.status !== normalStatus) ctx.throw(401, '权限不足');
      }
      const optionStatus = {
        type: 'article',
        anonymous: null,
        disabled: null,
        complaint: null,
        reviewed: null,
        edit: null,
        ipInfo: null,
        violation: null,
        blacklist: null,
        source: document.source
      };
      if(user) {
        if(permission('review')) {
              optionStatus.reviewed = document.status;
        }
        if(uid === article.uid) {
              optionStatus.edit = true;
        }
        //退修禁用权限
        optionStatus.disabled = (
          (ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft'))
        )? true: null;
        //投诉权限
        optionStatus.complaint = permission('complaintPost')?true:null;
        //查看IP
        optionStatus.ipInfo = ctx.permission('ipinfo')? document.ip : null;
        // 未匿名
        if(!document.anonymous) {
              if(user.uid !== article.uid) {
                    // 黑名单
                    optionStatus.blacklist = await db.BlacklistModel.checkUser(user.uid, article.uid);
              }
              // 违规记录
              optionStatus.violation = ctx.permission('violationRecord')? true: null;
              optionStatus.articleUserId = article.uid;
        }
      }
      data.optionStatus = optionStatus;
      data.toc = document.toc;
      await next();
  })
module.exports = router;
