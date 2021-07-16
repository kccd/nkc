const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {db, body} = ctx;
    const paymentRecord = await db.WechatPayRecordModel.setRecordStatusByNotificationInfo(body);
    if(paymentRecord.status === 'success') {

    }
    return ctx.body = {
      code: 'SUCCESS',
      message: '成功'
    };
  })
  .get('/:_id', async (ctx, next) => {
    const {db, params, data} = ctx;
    const {_id} = params;
    const weChatPayRecord = await db.WechatPayRecordModel.findOne({_id});
    data.record = {
      status: weChatPayRecord.status,
      apiType:weChatPayRecord.apiType,
      url: weChatPayRecord.url,
      recordId: weChatPayRecord._id
    }
    ctx.template = 'payment/recordStatus.pug';
    await next();
  });
module.exports = router;
