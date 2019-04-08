const Router = require('koa-router');
const router = new Router();
router
  .use('/', async (ctx, next) => {
    const {db, data, params} = ctx;
    const {_id} = params;
    const {user} = data;
    const refund = await db.ShopRefundModel.findById(_id);
    if(refund.buyerId !== user.uid) ctx.throw(403, '您没有权限更改别人的退款申请');
    data.refund = refund;
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, body} = ctx;
    const {refund} = data;
    const {type, trackNumber, reason} = body;
    if(type === "giveUp") {
      // 用户撤销申请
      await refund.buyerGiveUp(reason);
    } else if(type === "submitTrackNumber") {
      // 用户提交快递单号
      await refund.insertTrackNumber(trackNumber);
    }
    await next();
  });
module.exports = router;