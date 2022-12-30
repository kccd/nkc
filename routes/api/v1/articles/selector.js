const router = require('koa-router')();
router
  .get('', async (ctx, next) => {
    //获取当前登录用户的独立文章信息
    const { db, data, params, query, state, permission, nkcModules } = ctx;
    const {user} = data;
    ctx.apiData = {
      articles: [{a:1},{a:2}]
    };
    await next();
  })
module.exports = router;
