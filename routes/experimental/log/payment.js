const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, query, data, nkcModules} = ctx;
    const {t, page = 0} = query;
    const model = t === 'wechatPay'? db.WechatPayRecordModel: db.AliPayRecordModel;
    const count = await model.countDocuments({});
    const paging = nkcModules.apiFunction.paging(page, count);
    const records = await model.find({}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const usersId = [];
    for(const r of records) {
      usersId.push(r.uid);
    }
    const users = await db.UserModel.find({uid: {$in: usersId}}, {uid: 1, avatar: 1, username: 1});
    const usersObj = {};
    for(const u of users) {
      usersObj[u.uid] = u;
    }
    data.records = [];
    const from = {
      'score': '积分系统',
      'fund': '基金系统',
    };
    for(let r of records) {
      r = r.toObject();
      r.from = from[r.from];
      const user = usersObj[r.uid];
      if(user) r.user = user;
      data.records.push(r);
    }
    data.t = t;
    data.paging = paging;
    ctx.template = 'experimental/log/payment.pug';
    await next();
  });
module.exports = router;