const router = require('koa-router')();
const nkcRender = require('../../nkcModules/nkcRender');
const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');
const { DynamicOperations } = require('../../settings/operations');

router
  .use(
    ['/preview', '/history', '/history/:_id', '/history/:_id/edit'],
    async (ctx, next) => {
      const { db, query, state } = ctx;
      const { source, sid } = query;
      const { uid: targetUserId } = await db.DocumentModel.findOne(
        { source, sid },
        { uid: 1 },
      );
      if (
        state.uid !== targetUserId &&
        !ctx.permission(DynamicOperations.viewUserArticle) &&
        !ctx.permission('review')
      ) {
        ctx.throw(403, '权限不足');
      }
      await next();
    },
  )
  .get('/d/:did', async (ctx, next) => {
    const { db, state, permission } = ctx;
    const { did } = ctx.params;
    const { pageSettings } = state;
    const { normal } = await db.DocumentModel.getDocumentStatus();
    const { stable } = await db.DocumentModel.getDocumentTypes();
    const { article, comment } = await db.DocumentModel.getDocumentSources();
    const match = { did, type: stable };
    const document = await db.DocumentModel.findOne(match);
    if (!document || ![article, comment].includes(document.source)) {
      ctx.throw(404, '当前访问文档不存在');
    }
    if (document.status !== normal && !permission('review')) {
      if (!state.uid || document.uid !== state.uid) {
        ctx.throw(403, '权限不足');
      }
    }
    // 查询是长电文还是长电文的回复
    if (document.source === article) {
      // 查询独立文章是否在唯一专栏中
      const columnPosts = await db.ColumnPostModel.find({
        pid: document.sid,
        type: 'article',
      });
      if (columnPosts.length === 1) {
        return ctx.redirect(
          `/m/${columnPosts[0].columnId}/a/${columnPosts[0]._id}`,
        );
      }
      return ctx.redirect(`/z/a/${document.sid}`);
    }
    if (document.source === comment) {
      const singleComment = await db.CommentModel.findOne({
        _id: document.sid,
        // status: normal,
      });
      const page = Math.floor(
        (singleComment.order - 1) / pageSettings.homeThreadList,
      );
      const { sid } = await db.ArticlePostModel.findOne({
        _id: singleComment.sid,
      });
      if (sid) {
        // 查询文章是否在唯一专栏中
        const columnPosts = await db.ColumnPostModel.find({
          pid: sid,
          type: 'article',
        });
        if (columnPosts.length === 1) {
          return ctx.redirect(
            `/m/${columnPosts[0].columnId}/a/${columnPosts[0]._id}?page=${page}&highlight=${document.sid}#highlight`,
          );
        }
        return ctx.redirect(
          `/z/a/${sid}?page=${page}&highlight=${document.sid}#highlight`,
        );
      }
    }
    await next();
  })
  .get('/preview', async (ctx, next) => {
    //获取文档预览信息
    const { db, data, query, nkcModules } = ctx;
    const { sid, source } = query;
    const documentTypes = await db.DocumentModel.getDocumentTypes();
    // 需要返回 分类信息
    const document = await db.DocumentModel.findOne({
      sid,
      source,
      type: documentTypes.beta,
    }).sort({ tlm: -1 });
    if (!document) {
      ctx.throw(400, '没有可以预览的内容');
    }

    // 用于pug渲染判断当前是什么类型页面
    data.type = source;
    data.document = document;
    // 访问的文章是否是作者本人如果不是那么判断是否有权限访问
    const documentResourceId = await data.document.getResourceReferenceId();
    let resources = await db.ResourceModel.getResourcesByReference(
      documentResourceId,
    );
    if (data.document.l === 'json') {
      data.document.content = renderHTMLByJSON({
        json: data.document.content,
        resources,
      });
    } else {
      data.document.content = nkcRender.renderHTML({
        type: 'article',
        post: {
          c: data.document.content,
          resources,
        },
      });
    }

    // 查询文章作者
    const user = await db.UserModel.findOnly({ uid: data.document.uid });
    const avatarUrl = nkcModules.tools.getUrl('userAvatar', user.avatar);
    data.user = { ...user.toObject(), avatarUrl };
    if (data.document.origin !== 0) {
      const originDesc = await nkcModules.apiFunction.getOriginLevel(
        data.document.origin,
      );
      data.document = { ...data.document.toObject(), originDesc };
    } else {
      data.document = data.document.toObject();
    }
    ctx.template = 'document/preview/document.pug';
    await next();
  })
  .get('/history', async (ctx, next) => {
    //获取文档历史版本
    ctx.template = 'document/history/document.pug';
    const { db, data, state, query, nkcModules } = ctx;
    const { sid, source, page = 0 } = query;
    data.type = source;
    const { betaHistory, stableHistory } =
      await db.DocumentModel.getDocumentTypes();
    const queryCriteria = {
      $and: [{ sid, source }, { type: { $in: [betaHistory, stableHistory] } }],
    };
    //  获取列表
    // 返回分页信息
    const count = await db.DocumentModel.countDocuments(queryCriteria);
    const paging = nkcModules.apiFunction.paging(page, count, 10);
    data.paging = paging;
    data.history = await db.DocumentModel.find(queryCriteria)
      .sort({ tlm: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    if (data.history.length) {
      // 默认返回第一项内容
      data.document = data.history[0];
      // data.document.user = await db.UserModel.findOnly({uid: data.document.uid});
      const documentResourceId = await data.document.getResourceReferenceId();
      let resources = await db.ResourceModel.getResourcesByReference(
        documentResourceId,
      );
      if (data.document.l === 'json') {
        data.document.content = renderHTMLByJSON({
          json: data.document.content,
          resources,
        });
      } else {
        data.document.content = nkcRender.renderHTML({
          type: 'article',
          post: {
            c: data.document.content,
            resources,
          },
        });
      }

      let article;
      let editorUrl;
      if (source === 'article') {
        article = await db.ArticleModel.findOne({
          _id: data.document.sid,
        });
        //  选择此版本进行编辑的url
        editorUrl = await db.ArticleModel.getArticleUrlBySource(
          article._id,
          article.source,
          article.sid,
        );
      }
      if (source === 'draft') {
        editorUrl = await db.ArticleModel.getArticleUrlBySource(
          data.document.sid,
          data.document.source,
          data.document.sid,
        );
      }
      if (!editorUrl) {
        ctx.throw(400, 'source参数不正确');
      }
      // data.bookId = bid
      // 包含了将此版本改为编辑版的url 组成
      data.urlComponent = {
        _id: data.document._id,
        source: data.document.source,
        sid: data.document.sid,
        editorUrl,
        page,
      };
      const user = await db.UserModel.findOnly({ uid: data.document.uid });
      const avatarUrl = nkcModules.tools.getUrl('userAvatar', user.avatar);
      data.user = { ...user.toObject(), avatarUrl };
      if (data.document.origin !== 0) {
        const originDesc = await nkcModules.apiFunction.getOriginLevel(
          data.document.origin,
        );
        data.document = { ...data.document.toObject(), originDesc };
      } else {
        data.document = data.document.toObject();
      }
    } else {
      data.document = '';
      // data.bookId = ''
      data.urlComponent = '';
    }
    await next();
  })
  .get('/history/:_id', async (ctx, next) => {
    ctx.template = 'document/history/document.pug';
    const { db, data, params, query, nkcModules } = ctx;
    const { sid, source, page = 0 } = query;
    const { _id } = params;
    data.type = source;
    const { betaHistory, stableHistory } =
      await db.DocumentModel.getDocumentTypes();
    const queryCriteria = {
      sid,
      source,
      type: { $in: [betaHistory, stableHistory] },
    };
    const count = await db.DocumentModel.countDocuments(queryCriteria);
    const paging = nkcModules.apiFunction.paging(page, count, 10);
    data.type = source;
    data.history = await db.DocumentModel.find(queryCriteria)
      .sort({ tlm: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    function find(data, id) {
      for (const obj of data) {
        if (obj._id === id) {
          return obj;
        }
      }
    }
    // 在 历史记录中找到当前需要显示内容的文章
    data.document = find(data.history, Number(_id));
    if (!data.document) {
      // 如果添加了很多历史记录，而没有刷新，直接点击历史就可能出现在当前页找不到指定的数据，因为数据发生了改变（主要是可能排在了其他页中）
      data.document = data.history[0];
    }
    data.paging = paging;
    const documentResourceId = await data.document.getResourceReferenceId();
    let resources = await db.ResourceModel.getResourcesByReference(
      documentResourceId,
    );
    if (data.document.l === 'json') {
      data.document.content = renderHTMLByJSON({
        json: data.document.content,
        resources,
      });
    } else {
      data.document.content = nkcRender.renderHTML({
        type: 'article',
        post: {
          c: data.document.content,
          resources,
        },
      });
    }

    let article;
    let editorUrl;
    if (source === 'article') {
      article = await db.ArticleModel.findOne({
        _id: data.document.sid,
      });
      //  选择此版本进行编辑的url
      if (article.source === 'column') {
        if (!article.sid) {
          editorUrl = {
            editorUrl: `/creation/editor/column?source=column&aid=${article._id}`,
          };
        } else {
          editorUrl = await db.ArticleModel.getArticleUrlBySource(
            article._id,
            article.source,
            article.sid.split('-')[0],
          );
        }
      } else {
        editorUrl = await db.ArticleModel.getArticleUrlBySource(
          article._id,
          article.source,
          article.sid,
        );
      }
    }
    if (source === 'draft') {
      editorUrl = await db.ArticleModel.getArticleUrlBySource(
        data.document.sid,
        data.document.source,
        data.document.sid,
      );
    }
    if (typeof editorUrl === 'undefined') {
      throw 'editorUrl is not defined';
    }
    data.urlComponent = {
      _id: data.document._id,
      source: data.document.source,
      sid: data.document.sid,
      editorUrl,
      page,
    };
    const user = await db.UserModel.findOnly({ uid: data.document.uid });
    const avatarUrl = nkcModules.tools.getUrl('userAvatar', user.avatar);
    data.user = { ...user.toObject(), avatarUrl };
    if (data.document.origin !== 0) {
      const originDesc = await nkcModules.apiFunction.getOriginLevel(
        data.document.origin,
      );
      data.document = { ...data.document.toObject(), originDesc };
    } else {
      data.document = data.document.toObject();
    }
    await next();
  })
  .post('/history/:_id/edit', async (ctx, next) => {
    const { db, params, query, state } = ctx;
    //  正在编辑的改为历史版
    const { sid, source } = query;
    // 当前历史记录改为编辑版，并且复制了一份为历史版
    const { _id } = params;
    await db.DocumentModel.copyToHistoryToEditDocument(
      state.uid,
      sid,
      source,
      Number(_id),
    );
    await next();
  });
module.exports = router;
