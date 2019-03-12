const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {query, data, nkcModules} = ctx;
    const {user} = data;
    let {type, money} = query;
    if(type === 'get_url') {
      money = Number(money);
      if(money > 0){}
      else {
        ctx.throw(400, '充值数额必须大于0');
      }
      const options = {
        money,
        id: 
      };
      data.url = await nkcModules.alipay2.receipt(options);
    }
    ctx.template = 'account/finance/recharge.pug';
    await next();
  });
module.exports = router;