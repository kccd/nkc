const router = require('koa-router')();
const { OnlyUser } = require('../../middlewares/permission');
const {
  collectionService,
} = require('../../services/subscribe/collection.service');
router.get('/', OnlyUser(), async (ctx, next) => {
  const { db, data, params, state, permission, permissionsOr, query } = ctx;
  const { aid } = params;
  const { user } = data;
  const { uid } = state;
  const { columnId } = query;
  const { normal: articleStatus } = await db.ArticleModel.getArticleStatus();
  let article = await db.ArticleModel.findOnly({ _id: aid });
  if (!article) {
    ctx.throw(404, '未找到文章，请刷新后重试');
  }
  article = (await db.ArticleModel.getArticlesInfo([article]))[0];
  data.article = article;
  const { stable: stableType } = await db.DocumentModel.getDocumentTypes();
  const { normal: normalStatus } = await db.DocumentModel.getDocumentStatus();
  const { article: articleSource } =
    await db.DocumentModel.getDocumentSources();
  const document = await db.DocumentModel.findOnly({
    did: article.did,
    type: stableType,
    source: articleSource,
  });
  if (!document) {
    return ctx.throw(404, '未找到文章，请刷新后重试');
  }
  if (!permission('review')) {
    if (document.status !== normalStatus && uid !== article.uid) {
      ctx.throw(401, '权限不足');
    }
  }
  const optionStatus = {
    type: 'article',
    anonymous: null,
    disabled: null,
    complaint: null,
    collection: null,
    reviewed: null,
    edit: null,
    ipInfo: null,
    violation: null,
    blacklist: null,
    history: null,
    source: document.source,
    digest: null,
    xsf: null,
    move: null,
  };
  if (user) {
    data.digestRewardScore = await db.SettingModel.getScoreByOperationType(
      'digestRewardScore',
    );
    data.redEnvelopeSettings = await db.SettingModel.getSettings('redEnvelope');
    if (permission('review')) {
      optionStatus.reviewed = document.status;
      optionStatus.history = true;
    }
    if (ctx.permission('digestPost')) {
      optionStatus.digest = article.digest;
    }

    if (uid === article.uid || ctx.permission('viewUserArticle')) {
      optionStatus.history = true;
    }
    if (uid === article.uid || ctx.permission('modifyOtherArticles')) {
      optionStatus.edit = true;
    }
    // 评学术分
    if (ctx.permission('creditXsf')) {
      optionStatus.xsf = true;
    }
    //退修禁用权限
    optionStatus.disabled =
      ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft')
        ? true
        : null;
    optionStatus.collection = await collectionService.isCollectedArticle(
      user.uid,
      article._id,
    );
    //投诉权限
    optionStatus.complaint = true;
    //查看IP
    optionStatus.ipInfo = ctx.permission('ipinfo') ? document.ip : null;
    // 未匿名
    if (!document.anonymous) {
      if (user.uid !== article.uid) {
        // 黑名单
        optionStatus.blacklist = await db.BlacklistModel.checkUser(
          user.uid,
          article.uid,
        );
      }
      // 违规记录
      optionStatus.violation = ctx.permission('violationRecord') ? true : null;
      optionStatus.articleUserId = article.uid;
    }
    if (columnId) {
      const userPermissionObject =
        await db.ColumnModel.getUsersPermissionKeyObject();
      const column = await db.ColumnModel.findOne({ _id: columnId });
      if (column) {
        optionStatus.move =
          (await db.ColumnModel.checkUsersPermission(
            column.users,
            user.uid,
            userPermissionObject.column_settings_category,
          )) || user.uid === column.uid;
      }
    }
  }
  data.optionStatus = optionStatus;
  data.toc = document.toc;
  await next();
});
module.exports = router;
