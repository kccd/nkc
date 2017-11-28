const Router = require('koa-router');
const latestRouter = new Router();
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;
const dbFn = nkcModules.dbFunction;
latestRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const visibleFid = await ctx.getVisibleFid();
    const {digest, sortby} = query;
    const {user} = data;
    const page = query.page || 0;
    const q = {
      fid: {$in: visibleFid}
    };
    if(digest === 'true') q.digest = true;
    const threadCount = await db.ThreadModel.count(q);
    const {$skip, $limit, $match, $sort} = apiFn.getQueryObj(query, q);
    data.paging = apiFn.paging(page, threadCount);
    let threads = await db.ThreadModel.find($match).sort($sort).skip($skip).limit($limit);
    threads = await Promise.all(threads.map(async t => {
      await t.extendFirstPost().then(p => p.extendUser());
      await t.extendLastPost().then(p => p.extendUser());
      await t.extendForum();
      return t;
    }));
    data.indexThreads = threads;
    data.indexForumList = await dbFn.getAvailableForums(ctx);
    data.digest = digest;
    data.sortby = sortby;
    data.content = 'forum';
    if(data.user)
      data.userThreads = await data.user.getUsersThreads();
    ctx.template = 'interface_latest_threads.pug';
    await next()
  });

module.exports = latestRouter;