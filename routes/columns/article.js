const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query} = ctx;
  ctx.template = 'columns/article/article.pug';
  const {_id, aid} = params;
  // const category =  query
  let article = await db.ColumnPostModel.getDataRequiredForArticle(_id, aid);
  data.article = article
  await next();
})
module.exports = router;