const Router = require('koa-router');
const activityRouter = new Router();
const releaseRouter = require("./release");
const listRouter = require("./list");
const singleRouter = require("./single");
const myApplyRouter = require("./myApply");
const myReleaseRouter = require("./myRelease");
const postRouter = require("./post");
const modifyRouter = require("./modify");
const apiFn = require('../../nkcModules/apiFunction');
activityRouter
.use('/', async (ctx, next) => {
  const {data, db} = ctx;
  await next();
})
.get('/', async (ctx, next) => {
  const {query, data, db} = ctx;
  // 获取近期和历史活动
  let recentActivityArr = await db.ActivityModel.find({activityType: {$nin:["close"]}, holdEndTime: {$gt: Date.now()}}).sort({toc: -1});
  let historyActivityArr = await db.ActivityModel.find({activityType: {$nin:["close"]}, holdEndTime: {$lt: Date.now()}}).sort({toc: -1}).limit(8);
  data.recentActivityArr = recentActivityArr;
  data.historyActivityArr = historyActivityArr;
  ctx.template = 'activity/activityIndex.pug';
  await next();
})
.use('/release', releaseRouter.routes(), releaseRouter.allowedMethods())
.use('/list', listRouter.routes(), listRouter.allowedMethods())
.use('/single', singleRouter.routes(), singleRouter.allowedMethods())
.use('/myApply', myApplyRouter.routes(), myApplyRouter.allowedMethods())
.use('/post', postRouter.routes(), postRouter.allowedMethods())
.use('/myRelease', myReleaseRouter.routes(), myReleaseRouter.allowedMethods())
.use('/modify', modifyRouter.routes(), modifyRouter.allowedMethods());
module.exports = activityRouter;