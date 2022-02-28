const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params, query} = ctx;
  ctx.template = 'columns/article/article.pug';
  const {_id, aid} = params;
  // const category =  query
  let article = await db.ColumnPostModel.getRequiredData(_id, aid);
  // console.log(article,'article')
  data.article = article
  // const a = await db.ColumnPostCategoryModel.getCategoryTree(100022)
  // console.log(a,'category')

  //获取页头左边路径导航 文章所属分类 名字 和 id
  // 返回个数组对象 并且是排序过后的
  // if(category.c){
    
  // let categoryInfo = await db.ColumnPostCategoryModel.getParentCategoryById(category.c)
    
  // data.article.category = {name:categoryInfo.name, id:categoryInfo._id}
  // }
  await next();
})
module.exports = router;