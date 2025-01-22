const Router = require('koa-router');
const { OnlyUnbannedUser, OnlyUser } = require('../../middlewares/permission');
const router = new Router();
router.get('/', OnlyUser(), async (ctx, next) => {
  ctx.template = 'account/contribute/contribute.pug';
  const { nkcModules, data, db, query } = ctx;
  const { page = 0, articleId = '' } = query;
  const { user } = data;
  const article = await db.ArticleModel.findOne({ _id: articleId });
  const q = {
    uid: user.uid,
  };
  if (article) {
    q.tid = articleId;
  }
  const count = await db.ColumnContributeModel.countDocuments(q);
  const paging = nkcModules.apiFunction.paging(page, count);
  data.paging = paging;
  // const contributes = await db.ColumnContributeModel.find({uid: user.uid}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const contributes = await db.ColumnContributeModel.find(q)
    .sort({ toc: -1 })
    .skip(paging.start)
    .limit(paging.perpage);
  data.contributes = await db.ColumnContributeModel.extendContributes(
    contributes,
  );
  // for(const c of data.contributes) {
  //   c.column = await db.ColumnModel.findOne({_id: c.columnId});
  // }
  await next();
});
module.exports = router;
