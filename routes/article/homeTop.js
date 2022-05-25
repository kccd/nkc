const router = require('koa-router')();

router
  .use('/', async (ctx, next) => {
    const {body, query, data} = ctx;
    const type = body.type || query.type;
    if(type === 'latest') {
      data.valueName = 'latestToppedArticlesId';
    } else if(type === 'community') {
      data.valueName = 'communityToppedArticlesId';
    } else {
      data.valueName = 'toppedArticlesId';
    }
    await next();
  })
  .post('/', async (ctx, next) => {
    //独立文章首页置顶
    const {db, data, params, query, body} = ctx;
    const {aid} = params;
    const {valueName} = data;
    
    
    await next()
  })
  .del('/', async (ctx, next) => {
    //独立文章首页取消置顶
    const {db, data, params} = ctx;
    const {_id} = params;
    await next();
  })

module.exports = router;
