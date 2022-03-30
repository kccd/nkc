const Router = require("koa-router");
const router = new Router();
router
  .get('/', async (ctx, next) => {
    //获取用户收藏的文章
    const {db, data, state, params} = ctx;
    const {uid} = params;
    await next();
  })
module.exports = router;
