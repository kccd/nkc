const Router = require('koa-router');
const {
  wechatPayService,
} = require('../../../services/payment/wechatPay.service');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.visitExperimentalRecharge),
  async (ctx, next) => {
    const { nkcModules, query, data, db } = ctx;
    const { page = 0, t, content } = query;
    const q = {
      type: 'recharge',
    };
    if (!t) {
    } else if (t === 'username') {
      const user = await db.UserModel.findOne({
        usernameLowerCase: content.toLowerCase(),
      });
      if (!user) {
        data.info = '未找到用户';
      } else {
        q.to = user.uid;
      }
    } else if (t === 'uid') {
      const user = await db.UserModel.findOne({ uid: content });
      if (!user) {
        data.info = '未找到用户';
      } else {
        q.to = user.uid;
      }
    } else if (t === 'ip') {
      q.ip = content;
    }
    const count = await db.KcbsRecordModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const records = await db.KcbsRecordModel.find(q)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.records = await db.KcbsRecordModel.extendKcbsRecords(records);
    ctx.template = 'experimental/log/recharge.pug';
    data.t = t;
    data.paging = paging;
    data.content = content;
    await next();
  },
);

router.post(
  '/:recordId',
  OnlyOperation(Operations.visitExperimentalRecharge),
  async (ctx, next) => {
    const record = await ctx.db.KcbsRecordModel.findOne({
      _id: ctx.body.recordId,
    });
    if (!record) {
      ctx.throw(400, `账单ID（${ctx.body.recordId}）不正确`);
    }
    if (record.paymentType === 'aliPay') {
      ctx.throw(403, '暂不支持支付宝');
    }

    await wechatPayService.syncRecordStatus(record.paymentId);

    const newRecord = await ctx.db.KcbsRecordModel.findOnly({
      _id: ctx.body.recordId,
    });

    ctx.apiData = {
      record: newRecord,
    };
    await next();
  },
);
module.exports = router;
