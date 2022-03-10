const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {state, db, data, query, nkcModules} = ctx;
    const {page = 0} = query;
    const subUid= await db.SubscribeModel.getUserSubUsersId(state.uid);
    subUid.push(state.uid);
    const match = {
      uid: {$in: subUid},
      status: (await db.MomentModel.getMomentStatus()).normal,
      parent: '',
    };
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage)
    data.momentsData = await db.MomentModel.extendMomentsListData(moments);
    data.paging = paging;
    ctx.template = 'subscribe/moment.pug';
    await next();
  });
module.exports = router;