const router = require('koa-router')();
router.get('/:aid', async (ctx, next)=>{
  const {db, data, nkcModules, params} = ctx;
  ctx.template = 'columns/article.pug';
  const {_id, aid} = params;
  let article = await db.ColumnPostModel.getArticleById(_id, aid);
  article = article.toObject()
  const allowKey = ['t','c','abstratCn','abstratEn','keyWordsCn','keyWordsEn'];
  let articleObj = {} 
  // console.log(article,'article')
  for (const key in article) {
    if (Object.hasOwnProperty.call(article, key)) {
      console.log(key,allowKey.includes(key))
      if(allowKey.includes(key)){
        const item = article[key];
        articleObj[key] = item
      }
    }
  }
  data.article = articleObj;
  console.log(articleObj,'articleObj',articleObj.keyWordsCn,'keyWordsCn')
  await next();
})
module.exports = router;