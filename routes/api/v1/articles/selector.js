const permissions = require('../../../../middlewares/permission');
const { renderHTMLByJSON } = require('../../../../nkcModules/nkcRender/json');
const router = require('koa-router')();
router
  .get('/', permissions.OnlyUser(), async (ctx, next) => {
    //获取当前登录用户的独立文章信息
    const { db, data, query, nkcModules } = ctx;
    const { user } = data;
    const { page, selectedSource } = query;
    const articleStatus = await db.ArticleModel.getArticleStatus();
    const match = {
      uid: user.uid,
      status: articleStatus.normal,
      source: selectedSource,
    };
    const count = await db.ArticleModel.countDocuments(match);
    const paging = await nkcModules.apiFunction.paging(page, count);
    const documentSources = await db.DocumentModel.getDocumentSources();
    const documentTypes = await db.DocumentModel.getDocumentTypes();
    const columnPostTypes = await db.ColumnPostModel.getColumnPostTypes();
    const articles = await db.ArticleModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: { toc: -1 },
      },
      {
        $skip: paging.start,
      },
      {
        $limit: paging.perpage,
      },
      {
        $project: {
          did: 1,
          _id: 1,
          source: 1,
        },
      },
      {
        $lookup: {
          from: 'documents',
          let: { did: '$did' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$did', '$$did'] },
                    { $eq: ['$source', documentSources.article] },
                    { $eq: ['$type', documentTypes.stable] },
                  ],
                },
              },
            },
            { $project: { title: 1, content: 1, dt: 1, _id: 0, l: 1 } },
          ],
          as: 'doc',
        },
      },

      {
        $lookup: {
          from: 'columnPosts',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$pid', '$$id'] },
                    { $eq: ['$type', columnPostTypes.article] },
                  ],
                },
              },
            },
            { $project: { columnId: 1, article: '$_id', _id: 0 } },
          ],
          as: 'columnArticle',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              { $arrayElemAt: ['$doc', 0] },
              { $arrayElemAt: ['$columnArticle', 0] },
              '$$ROOT',
            ],
          },
        },
      },
      { $project: { doc: 0, columnArticle: 0, did: 0 } },
    ]);
    ctx.apiData = {
      articles: articles.map((item) => {
        let url;
        if (item.source === 'zone') {
          url = nkcModules.tools.getUrl('zoneArticle', item._id);
        } else {
          url = nkcModules.tools.getUrl(
            'columnArticle',
            item.columnId,
            item.article,
          );
          if (!item.columnId) {
            url = `/article/${item._id}`;
          }
        }
        return {
          tid: item._id,
          source: item.source,
          toc: item.dt,
          t: item.title,
          c: nkcModules.nkcRender.htmlToPlain(
            item.l === 'json'
              ? renderHTMLByJSON({ json: item.content })
              : item.content,
            200,
          ),
          url,
        };
      }),
      paging,
    };
    await next();
  })
  .get('/search', permissions.OnlyUser(), async (ctx, next) => {
    //搜索当前登录用户的独立文章信息
    const { db, data, query, nkcModules } = ctx;
    const { user } = data;
    const { selectedSource, t } = query;
    if (!['zone', 'column'].includes(selectedSource)) {
      ctx.throw(403, '当前来访参数不匹配，请刷新');
    }
    // const articleStatus = await db.ArticleModel.getArticleStatus();
    // const match = {
    //   uid: user.uid,
    //   status: articleStatus.normal,
    //   source: selectedSource,
    // };
    const results = await nkcModules.elasticSearch.searchThreadOrArticle(
      'document_article',
      t,
      {
        uid: user.uid,
      },
    );
    let _articles = [];
    let _articlesObject = [];
    for (const item of results.hits.hits) {
      _articlesObject[item._source.tid] = item;
    }
    // 需要查询db过滤掉对应的电文、独立文章
    const tempArticles = await db.ArticleModel.find({
      did: {
        $in: [...results.hits.hits.map((item) => item._source.tid)],
      },
      source: selectedSource,
      status: 'normal',
    }).sort({ toc: -1 });
    for (const item of tempArticles) {
      _articles.push({
        tid: item._id,
        source: item.source,
        toc: item.toc,
        t: _articlesObject[item.did]._source.title,
        c: nkcModules.nkcRender.htmlToPlain(
          _articlesObject[item.did]._source.content,
          200,
        ),
        url: `/article/${item._id}`,
      });
    }
    ctx.apiData = {
      articles: _articles,
    };
    await next();
  });
module.exports = router;
