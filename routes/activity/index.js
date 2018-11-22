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
  const page = query.page? parseInt(query.page): 0;
  const q = {};
  let activitys = await db.ActivityModel.find({"activityType":"release"}).sort({toc: -1});
  let total = 0;
  const count = activitys.length;
  const paging = apiFn.paging(page, count);
  data.paging = paging;
  data.activitys = activitys;
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