const Router = require("koa-router");
const router = new Router();
router
  .get('/', async (ctx, next) => {
    //获取用户黑名单
    const {db, data, state, params} = ctx;
    const {uid} = params;
    ctx.template = 'vueRoot/index.pug';
    await next();
  })
module.exports = router;
