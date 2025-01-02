const router = require('koa-router')();
const draftRouter = require('./draft');
const optionsRouter = require('./options');
const unblockRouter = require('./unblock');
const collectionRouter = require('./collection');
const digestRouter = require('./digest');
const homeTopRouter = require('./homeTop');
const creditRouter = require('./credit');
const voteRouter = require('./vote');
const nkcRender = require('../../nkcModules/nkcRender');
const {
  OnlyUser,
  Public,
  OnlyOperation,
} = require('../../middlewares/permission');
const { renderMarkdown } = require('../../nkcModules/markdown');
const {
  collectionService,
} = require('../../services/subscribe/collection.service');
const { Operations } = require('../../settings/operations');
router
  .get('/:aid', Public(), async (ctx, next) => {
    //获取文章信息
    ctx.remoteTemplate = 'zone/article.pug';
    const { db, data, params, query, state, permission, nkcModules } = ctx;
    const { aid } = params;
    const { pageSettings, uid } = state;
    const { user } = data;
    const { page = 0, highlight, t, token } = query;
    const { normal: commentStatus, default: defaultComment } =
      await db.CommentModel.getCommentStatus();
    let article = await db.ArticleModel.findOnly({ _id: aid });
    const categoriesObj = await db.ThreadCategoryModel.getCategories(
      article.tcId,
      'article',
    );
    data.allCategories = categoriesObj.allCategories;
    data.categoryList = categoriesObj.categoryList;
    data.categoriesTree = categoriesObj.categoriesTree;
    data.targetUser = await article.extendUser();
    if (user) {
      let userSubscribeUsersId = [];
      userSubscribeUsersId = await db.SubscribeModel.getUserSubUsersId(
        user.uid,
      );
      data.subscribeAuthor = !!userSubscribeUsersId.includes(
        data.targetUser.uid,
      );
    }
    data.targetUser.description = renderMarkdown(
      nkcModules.nkcRender.replaceLink(data.targetUser.description),
    );
    data.targetUser.avatar = nkcModules.tools.getUrl(
      'userAvatar',
      data.targetUser.avatar,
    );
    await data.targetUser.extendGrade();
    await db.UserModel.extendUserInfo(data.targetUser);
    if (data.targetUser && typeof data.targetUser.toObject === 'function') {
      data.targetUser = data.targetUser.toObject();
    }
    const userColumn = await db.UserModel.getUserColumn(state.uid);
    if (userColumn) {
      data.addedToColumn =
        (await db.ColumnPostModel.countDocuments({
          columnId: userColumn._id,
          type: 'article',
          pid: aid,
        })) > 0;
    }

    const columnPermission = await db.UserModel.ensureApplyColumnPermission(
      data.user,
    );

    data.columnInfo = {
      userColumn: userColumn,
      columnPermission: columnPermission,
      column: userColumn,
    };
    if (token) {
      //如果存在token就验证token是否合法
      await db.ShareModel.hasPermission(token, article._id);
    }
    //查找文章的评论盒子
    const articlePost = await db.ArticlePostModel.findOne({
      sid: article._id,
      source: article.source,
    });
    // 获取空间文章需要显示的数据
    const articleRelatedContent = await db.ArticleModel.getZoneArticle(
      article._id,
      data.user,
    );
    const homeSettings = await db.SettingModel.getSettings('home');
    //点击楼层高亮需要url和highlight值
    data.originUrl = state.url;
    data.highlight = highlight;
    data.columnPost = articleRelatedContent;
    data.columnPost.article.vote = await db.PostsVoteModel.getVoteByUid({
      uid: state.uid,
      id: data.columnPost.article._id,
      type: 'article',
    });
    data.homeTopped = await db.SettingModel.isEqualOfArr(
      homeSettings.toppedThreadsId,
      { id: article._id, type: 'article' },
    );
    const isModerator = await article.isModerator(state.uid);
    const { normal: normalStatus } = await db.ArticleModel.getArticleStatus();
    const _article = (await db.ArticleModel.getArticlesInfo([article]))[0];
    if (_article.document.status !== normalStatus && !isModerator) {
      if (!permission('review')) {
        return ctx.throw(403, '权限不足');
      }
    }

    let match = {};
    if (articlePost) {
      match.sid = articlePost._id;
    }
    //只看作者
    if (t === 'author') {
      data.t = t;
      match.uid = _article.uid;
    }
    const permissions = {
      cancelXsf: ctx.permission('cancelXsf'),
      modifyKcbRecordReason: ctx.permission('modifyKcbRecordReason'),
      manageZoneArticleCategory: ctx.permission('manageZoneArticleCategory'),
      review: ctx.permission('review'),
      creditKcb: ctx.permission('creditKcb'),
      movePostsToRecycleOrMovePostsToDraft: ctx.permissionsOr([
        'movePostsToRecycle',
        'movePostsToDraft',
      ]),
      unblockPosts: ctx.permission('unblockPosts'),
    };
    //获取文章收藏数
    data.columnPost.collectedCount =
      await db.ArticleModel.getCollectedCountByAid(article._id);
    if (user) {
      if (permission('review')) {
        permissions.reviewed = true;
      } else {
        match.$or = [{ status: commentStatus }, { uid }];
      }
      //禁用和退修权限
      if (permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.disabled = true;
      }
      //是否收藏该文章
      data.columnPost.collected = await collectionService.isCollectedArticle(
        data.user.uid,
        article._id,
      );
    }
    let count = 0;
    //获取评论分页
    if (articlePost) {
      count = await db.CommentModel.countDocuments(match);
    }
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.homeThreadList,
    );
    data.paging = paging;
    let comment = null;
    let comments = [];
    //获取该文章下当前用户编辑了未发布的评论内容
    if (articlePost) {
      const m = {
        uid: state.uid,
        status: defaultComment,
        sid: articlePost._id,
      };
      comment = await db.CommentModel.getCommentsByArticleId({ match: m });
      //获取该文章下的评论
      comments = await db.CommentModel.getCommentsByArticleId({
        match,
        paging,
      });
    }
    if (comments && comments.length !== 0) {
      comments = await db.CommentModel.extendPostComments({
        comments,
        uid: state.uid,
        isModerator,
        permissions,
        authorUid: article.uid,
        targetUser: data.user,
      });
    }
    if (comment && comment.length !== 0) {
      //拓展单个评论内容
      comment = await comment[0].extendEditorComment();
      if (comment.type === 'beta') {
        data.comment = comment || '';
      }
    }
    data.articleStatus = _article.document.status;
    const hidePostSettings = await db.SettingModel.getSettings('hidePost');
    data.postHeight = hidePostSettings.postHeight;
    data.permissions = permissions;
    data.isModerator = isModerator;
    data.comments = comments || [];
    data.article = _article;
    data.authorRegisterInfo = await db.UserModel.getAccountRegisterInfo({
      uid: data.article.uid,
      ipId: data.article.document.ip,
    });
    if (article.source === 'column') {
      // 查询文章所在专栏
      const columnPosts = await db.ColumnPostModel.find({
        pid: article._id,
        type: 'article',
      });
      const columnIds = [];
      const columnPostsObject = {};
      for (const item of columnPosts) {
        columnIds.push(item.columnId);
        columnPostsObject[item.columnId] = item;
      }
      const columns = await db.ColumnModel.find({ _id: { $in: columnIds } });
      const tempColumns = [];
      for (const item of columns) {
        tempColumns.push({
          _id: item._id,
          homeUrl: nkcModules.tools.getUrl('columnHome', item._id),
          avatarUrl: nkcModules.tools.getUrl('userAvatar', item.avatar),
          name: item.name,
          subCount: item.subCount,
          postCount: item.postCount,
          articleUrl: `/m/${item._id}/a/${columnPostsObject[item._id]._id}`,
        });
      }
      if (tempColumns.length > 0) {
        data.columns = tempColumns;
      }
    }
    //文章浏览数加一
    await article.addArticleHits();
    await next();
  })
  .del('/:aid', OnlyOperation(Operations.deleteArticle), async (ctx, next) => {
    const { params, db, state, permission } = ctx;
    const { aid } = params;
    const { uid } = state; //登录用户uid
    const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
    // 针对 "source" : "column",---在删除文章之前需要检查文章是否已经成功投稿即具有专栏下的文章。
    if (article.source === 'column') {
      const columnPosts = await db.ColumnPostModel.find({ pid: article._id });
      if (columnPosts.length > 0) {
        ctx.throw(400, '该文章已经在专栏中，请撤稿后重试');
      }
    }
    if (uid === article.uid || permission('deleteArticle')) {
      //删除已经发布的文章的同时删除该文章的所有草稿
      await article.deleteArticle();
    }
    await next();
  })
  .use('/:aid/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/:aid/options', optionsRouter.routes(), optionsRouter.allowedMethods())
  .use('/:aid/unblock', unblockRouter.routes(), unblockRouter.allowedMethods())
  .use(
    '/:aid/collection',
    collectionRouter.routes(),
    collectionRouter.allowedMethods(),
  )
  .use('/:aid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:aid/homeTop', homeTopRouter.routes(), homeTopRouter.allowedMethods())
  .use('/:aid/credit', creditRouter.routes(), creditRouter.allowedMethods())
  .use('/:aid/vote', voteRouter.routes(), voteRouter.allowedMethods());
module.exports = router;
