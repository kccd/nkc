const Router = require('koa-router');
const router = new Router();
const rechargeRouter = require('./recharge');
const withdrawRouter = require('./withdraw');
router
  .get('/', async (ctx, next) => {
    const {nkcModules, query, data, db} = ctx;
    const {user} = data;
    const {t, page} = query;
    const q = {
      verify: true
    };
    if(!t) {
      q.to = user.uid;
    } else if(t === 'payout') {
      q.from = user.uid;
    } else {
      q.$or = [
        {
          from: user.uid
        }, {
          to: user.uid
        }
      ]
    }
    const count = await db.KcbsRecordModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    let kcbsRecords = await db.KcbsRecordModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    await db.KcbsRecordModel.hideSecretInfo(kcbsRecords);
    data.kcbsRecords = await db.KcbsRecordModel.extendKcbsRecords(kcbsRecords);
    data.paging = paging;
    data.t = t;
    data.user.kcb = await db.UserModel.updateUserKcb(data.user.uid);
    ctx.template = 'account/finance/finance.pug';
    await next();
  })
  .use('/recharge', rechargeRouter.routes(), rechargeRouter.allowedMethods())
  .use('/withdraw', withdrawRouter.routes(), withdrawRouter.allowedMethods());
module.exports = router;