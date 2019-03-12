const Router = require('koa-router');
const router = new Router();
const serverConfig = require('../../../config/server.json');
router
  .get('/', async (ctx, next) => {
    const {query, data, nkcModules, db} = ctx;
    const {user} = data;
    let {type, money} = query;
    if(type === 'get_url') {
      money = Number(money);
      if(money > 0){}
      else {
        ctx.throw(400, '充值数额必须大于0');
      }
      const kcbsRecordId = await db.SettingModel.operateSystemID('kcbsRecords', 1);
      const record = db.KcbsRecordModel({
        _id: kcbsRecordId,
        from: 'bank',
        to: user.uid,
        type: 'recharge',
        num: money,
        ip: ctx.address,
        port: ctx.port,
        verify: false,
        description: '科创币充值'
      });
      await record.save();
      const options = {
        money,
        id: kcbsRecordId,
        title: '订单标题',
        notes: '订单介绍',
        returnUrl: serverConfig.domain + '/account/finance/recharge?type=back',
        goodsInfo: [
          {
            goodsName: '商品名',
            goodsId: '商品Id',
            goodsCount: 1,
            goodsPrice: 234
          }
        ]
      };
      data.url = await nkcModules.alipay2.receipt(options);
    } else if(type === 'back') {
      delete query.type;
      await nkcModules.alipay2.verifySign(query);
      data.kcbsRecordId = query.out_trade_no;
      ctx.template = 'account/finance/rechargeBack.pug';
    } else if(type === 'verify') {
      const {rid} = query;
      const record = await db.KcbsRecordModel.findOne({_id: Number(rid), to: user.uid, type: 'recharge'});
      if(!record) ctx.throw(404, '账单未找到');
      if(record.verify) {
        data.verify = true;
        data.money = record.num;
      }
    } else {
      ctx.template = 'account/finance/recharge.pug';
    }
    await next();
  });
module.exports = router;