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
      money = money * 100;
      if(money < 100) ctx.throw(400, "科创币充值数量不能小于1");
      money = Number(money.toFixed(2));
      data.url = await db.KcbsRecordModel.getAlipayUrl({
        uid: user.uid,
        money,
        ip: ctx.address,
        port: ctx.port,
        title: '科创币充值',
        notes: `科创币充值，充值金额${money}`,
        backParams: {
          type: 'recharge'
        }
      });
    } else if(type === 'back') {
      if(query.pay) {
        data.pay = true;
        delete query.pay;
      }
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
  })
  // 支付宝访问服务器，返回支付结果
  .post('/', async (ctx) => {
    const {nkcModules, db, body} = ctx;
    const {out_trade_no, trade_status} = body;
    // 验证信息是否来自支付宝
    await nkcModules.alipay2.verifySign(body);
    // 查询科创币充值记录
    const record = await db.KcbsRecordModel.findOne({_id: out_trade_no});
    if(!record) return ctx.body = 'success';
    const totalAmount = Number(body.total_amount)*100;
    if(trade_status === 'TRADE_SUCCESS') {
      let backParams = body.passback_params;
      backParams = JSON.parse(decodeURI(backParams));
      if(record.verify) return ctx.body = 'success';
      if(backParams.type === 'recharge') {
        const updateObj = {
          verify: true,
          c: body
        };
        if(record.num !== totalAmount) {
          updateObj.error = '系统账单金额与支付宝账单金额不相等';
        } else {
          await db.UserModel.update({uid: record.to}, {$inc: {kcb: record.num}});
          await db.SettingModel.update({_id: 'kcb'}, {$inc: {'c.totalMoney': -1*record.num}});
        }
        await record.update(updateObj);
      } else {
        const updateObj = {
          verify: true,
          c: body
        };
        const ordersId = backParams.ordersId;
        let orders = [];
        let totalMoney = 0;
        for(const id of ordersId) {
          const order = await db.ShopOrdersModel.findOne({orderId: id});
          if(!order) {
            updateObj.error = `支付宝回调信息中的订单ID(${id})不存在`;
            await record.update(updateObj);
            return ctx.body = 'success';
          }
          orders.push(order);
          totalMoney += order.orderPrice;
        }
        if(totalMoney !== totalAmount) {
          updateObj.error = '系统账单金额与支付宝账单金额不相等';
          await record.update(updateObj);
          return ctx.body = 'success';
        }
        orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
        for(const order of orders) {
          const r = db.KcbsRecordModel({
            _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
            from: record.to,
            to: record.from,
            type: 'pay',
            ordersId: [order.orderId],
            num: order.orderPrice,
            description: `${order.count}x${order.product.name}(${order.productParam.name.join('+')})`,
            ip: ctx.address,
            port: ctx.port,
            verify: true
          });
          await r.save();
          // 更改订单状态为已付款，添加付款时间。
          await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
            orderStatus: 'unShip',
            payToc: r.toc
          }});
        }

        await record.update(updateObj);

      }
      return ctx.body = 'success';
    }
  });
module.exports = router;