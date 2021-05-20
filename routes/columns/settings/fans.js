const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    const {column} = data;
    const {page = 0} = query;
    const match = {
      columnId: column._id,
      type: 'column',
      cancel: false,
    };
    const count = await db.SubscribeModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const subscribes = await db.SubscribeModel
      .find(match, {
        uid: 1
      })
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    let usersId = [];
    for(const s of subscribes) {
      usersId.push(s.uid);
    }
    usersId = [...new Set(usersId)];
    const users = await db.UserModel.find({
      uid: {$in: usersId}
    }, {
      uid: 1,
      username: 1,
      avatar: 1,
      description: 1
    });
    const usersObj = {};
    for(const u of users) {
      usersObj[u.uid] = u;
    }
    const fans = [];
    for(const id of usersId) {
      const u = usersObj[id];
      fans.push(u);
    }
    data.fans = fans;
    data.paging = paging;
    ctx.template = 'columns/settings/fans.pug';
    data.nav = 'fans';
    await next();
  })
  .del('/', async (ctx, next) => {
    const {db, data, query} = ctx;
    const {uid} = query;
    const {column} = data;
    const subscribe = await db.SubscribeModel.findOne({
      type: 'column',
      uid,
      cancel: false,
      columnId: column._id,
    });
    if(subscribe) {
      await subscribe.cancelSubscribe();
      await db.SubscribeModel.saveUserSubColumnsId(uid);
    }
    await next();
  });
module.exports = router;