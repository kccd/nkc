const Router = require("koa-router");
const moment = require('moment');
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {user, column} = data;
    if(column.uid !== user.uid && !ctx.permission('column_single_disabled')) ctx.throw(403, "权限不足");
    const {sort, page} = query;
    if(sort === undefined) {
      await column.updateBasicInfo();
      data.nav = 'status';
      const maxTime = new Date();
      const minTime = new Date(maxTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      data.subscriptions = await column.getSubscriptionTrends(minTime, maxTime);
      data.hits = await column.getHitTrends(minTime, maxTime);
      data.voteUp = await column.getVoteUpTrends(minTime, maxTime);
      data.share = await column.getShareTrends(minTime, maxTime);
      ctx.template = "columns/status/status.pug";
    } else {
      const columnPostsDB = await db.ColumnPostModel.find({
        type: 'thread',
        columnId: column._id,
      }, {
        tid: 1,
        pid: 1,
      });
      const paging = nkcModules.apiFunction.paging(page, columnPostsDB.length);
      const columnThreadsId = [];
      const columnPostsId = [];
      columnPostsDB.map(cp => {
        columnThreadsId.push(cp.tid);
        columnPostsId.push(cp.pid);
      })
      let sortObj;
      if(sort === 'hit') {
        sortObj = {
          hits: -1,
        }
      } else if(sort === 'postCount') {
        sortObj = {
          count: -1,
        }
      } else {
        sortObj = {
          voteUp: -1
        }
      }
      const threads = await db.ThreadModel.find({
        tid: {
          $in: columnThreadsId
        }
      }, {
        tid: 1,
        hits: 1,
        oc: 1,
        count: 1,
        voteUp: 1
      })
        .sort(sortObj)
        .skip(paging.start)
        .limit(paging.perpage);
      const posts = await db.PostModel.find({
        pid: {$in: columnPostsId}
      }, {
        pid: 1,
        t: 1
      });
      const titles = {};
      for(const p of posts) {
        titles[p.pid] = p.t;
      }
      const columnPosts = [];
      for(const t of threads) {
        const {tid, oc, hits, count, voteUp} = t;
        const title = titles[oc];
        columnPosts.push({
          title,
          url: `/t/${tid}`,
          hits,
          postCount: count,
          voteUp
        });
      }
      data.columnPosts = columnPosts;
      data.paging = paging;
    }
    await next();
  });
module.exports = router;