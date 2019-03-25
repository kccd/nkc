const Router = require('koa-router');
const giveUpRouter = require('./giveUp');
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
  /* .patch('/', async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {refund} = body;
    const refundDB = data.refund;
    if(refund.root) ctx.throw(400, "申请暂无法修改，请等待平台裁决");
    if(!refund.reason) ctx.throw(400, '理由不能为空');
    if(tools.checkString.contentLength(refund.reason) > 1000) ctx.throw(400, '理由不能超过1000个字节');
    await db.ShopRefundModel.update({_id: refundDB._id}, {$set: {
      reason: refund.reason,
      type: refund.type
    }});
    await next();
  }) */
  .use("/give_up", giveUpRouter.routes(), giveUpRouter.allowedMethods());
module.exports = router;