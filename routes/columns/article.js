const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query} = ctx;
  ctx.template = 'columns/article/article.pug';
  const {_id, aid} = params;
  const category =  query
  let article = await db.ColumnPostModel.getRequiredData(_id, aid);

  // console.log(article,'article')
  data.article = article
  // 文章所属分类
  if(category.c){
    let categoryInfo = await db.ColumnPostCategoryModel.getCategoryNameById(category.c)
    data.article.category = {name:categoryInfo.name, id:categoryInfo._id}
  }
  await next();
})
module.exports = router;