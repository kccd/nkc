const router = require('koa-router')();
const permissions = require('../../../../middlewares/permission');
const { getJsonStringTextSlice } = require('../../../../nkcModules/json');
const { renderHTMLByJSON } = require('../../../../nkcModules/nkcRender/json');
router
  .get('/', permissions.OnlyUnbannedUser(), async (ctx, next) => {
    //获取当前登录用户的独立文章信息
    const { db, data, query, nkcModules } = ctx;
    const { user } = data;
    const { page } = query;
    const match = {
      uid: user.uid,
      reviewed: true,
      disabled: false,
    };
    const count = await db.ThreadModel.countDocuments(match);
    const postType = await db.PostModel.getType();
    const paging = await nkcModules.apiFunction.paging(page, count);
    const threads = await db.ThreadModel.aggregate([
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
          tid: 1,
          oc: 1,
        },
      },
      {
        $lookup: {
          from: 'posts',
          let: { oc_pid: '$oc' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$pid', '$$oc_pid'] },
                    { $eq: ['$anonymous', false] },
                    { $eq: ['$type', postType.thread] },
                  ],
                },
              },
            },
            { $project: { c: 1, pid: 1, t: 1, toc: 1, l: 1 } },
          ],
          as: 'content',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ['$content', 0] }, '$$ROOT'],
          },
        },
      },
      { $project: { content: 0 } },
    ]);
    const _articles = [];
    threads.forEach((item) => {
      if (item.toc) {
        _articles.push({
          tid: item.tid,
          toc: item.toc,
          t: item.t,
          source: postType.thread,
          c:
            item.l === 'json'
              ? getJsonStringTextSlice(item.c, 200)
              : nkcModules.nkcRender.htmlToPlain(item.c, 200),
          url: nkcModules.tools.getUrl('thread', item.tid),
        });
      }
    });
    ctx.apiData = {
      articles: _articles,
      paging,
    };
    await next();
  })
  .get('/search', permissions.OnlyUnbannedUser(), async (ctx, next) => {
    //搜索当前登录用户的文章信息
    const { db, data, query, nkcModules } = ctx;
    const { user } = data;
    const { page, selectedSource, t } = query;
    const articleStatus = await db.ArticleModel.getArticleStatus();
    const postType = await db.PostModel.getType();
    const match = {
      uid: user.uid,
      status: articleStatus.normal,
      source: selectedSource,
    };
    const results = await nkcModules.elasticSearch.searchThreadOrArticle(
      'thread',
      t,
      {
        uid: user.uid,
      },
    );
    const _articles = [];
    for (const item of results.hits.hits) {
      if (item._source.toc) {
        _articles.push({
          tid: item._source.tid,
          toc: item._source.toc,
          t: item._source.title,
          source: postType.thread,
          c: nkcModules.nkcRender.htmlToPlain(item._source.content, 200),
          url: nkcModules.tools.getUrl('thread', item._source.tid),
        });
      }
    }
    ctx.apiData = {
      articles: _articles,
    };
    await next();
  });
module.exports = router;
