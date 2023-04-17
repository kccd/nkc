const router = require('koa-router')();
const permissions = require('../../../../middlewares/permission');
router.get('/', permissions.OnlyUser(), async (ctx, next) => {
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
          { $project: { c: 1, pid: 1, t: 1, toc: 1 } },
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
        c: nkcModules.nkcRender.htmlToPlain(item.c, 200),
        url: nkcModules.tools.getUrl('thread', item.tid),
      });
    }
  });
  ctx.apiData = {
    articles: _articles,
    paging,
  };
  await next();
});
module.exports = router;
