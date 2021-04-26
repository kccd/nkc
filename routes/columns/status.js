const Router = require("koa-router");
const moment = require('moment');
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {column} = data;
    data.nav = 'status';
    const maxTime = new Date();
    const minTime = new Date(maxTime.getTime() - 30 * 24 * 60 * 60 * 1000);
    data.subscriptions = await column.getSubscriptionTrends(minTime, maxTime);
    data.hits = await column.getHitTrends(minTime, maxTime);
    data.voteUp = await column.getVoteUpTrends(minTime, maxTime);
    data.share = await column.getShareTrends(minTime, maxTime);
    ctx.template = "columns/status/status.pug";
    await next();
  });
module.exports = router;