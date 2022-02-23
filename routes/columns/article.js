const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params} = ctx;
  ctx.template = 'columns/article.pug';
  const {_id, aid} = params;
  let article = await db.ColumnPostModel.getRequiredData(_id, aid);
  console.log(article,'article')
  data.article = article
  await next();
})
module.exports = router;