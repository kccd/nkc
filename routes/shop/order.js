const Router = require('koa-router');
const router = new Router();
router
  // 提交订单，并跳转到支付
  .post('/', async (ctx, next) => {
    const {data, db, query, body} = ctx;
    const {post} = body;
    
    await next();
  })
module.exports = router;