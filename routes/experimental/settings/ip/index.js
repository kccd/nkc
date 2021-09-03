const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.ips = await db.IPBlacklistModel.find().sort({toc: -1});
    ctx.template = 'experimental/settings/ip/ip.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {state, db, body, nkcModules} = ctx;
    let {ips, description} = body;
    const {checkString} = nkcModules.checkData;
    checkString(description, {
      name: '说明',
      minLength: 0,
      maxLength: 5000
    });
    ips = ips.map(ip => ip.trim());
    ips = ips.filter(ip => !!ip);
    const now = new Date();
    const oldIps = await db.IPBlacklistModel.find({_id: {$in: ips}}, {_id: 1});
    if(oldIps.length !== 0) {
      ctx.throw(400, `IP 「${oldIps.map(o => o._id).join(', ')}」 已存在`);
    }
    for(let ip of ips) {
      await db.IPBlacklistModel.insertIP({
        toc: now,
        uid: state.uid,
        description,
        ip
      });
    }
    await db.IPBlacklistModel.saveIPBlacklistToRedis();
    await next();
  })
  .del('/', async (ctx, next) => {
    const {query, db, data} = ctx;
    const {ip} = query;
    await db.IPBlacklistModel.deleteOne({_id: ip});
    await db.IPBlacklistModel.saveIPBlacklistToRedis();
    await next();
  });
module.exports = router;