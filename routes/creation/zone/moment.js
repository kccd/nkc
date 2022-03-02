const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, db, data, state, nkcModules} = ctx;
    const {from, page} = query;
    // 编辑器获取待发布的动态
    if(from === 'editor') {
      const moment = await db.MomentModel.getUnPublishedMomentDataByUid(state.uid);
      if(moment) {
        const {momentId, videosId, picturesId, content} = moment;
        data.momentId = momentId;
        data.videosId = videosId;
        data.picturesId = picturesId;
        data.content = content;
      }
      return await next();
    }
    // 获取动态列表
    const match = {
      uid: state.uid,
      parent: '',
      status: 'normal',
    };
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsData(moments);
    data.paging = paging;
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, state, data} = ctx;
    const {type, content, resourcesId} = body;
    let moment = await db.MomentModel.getUnPublishedMomentByUid(state.uid);
    if(!moment) {
      moment = await db.MomentModel.createMoment({
        content,
        resourcesId,
        uid: state.uid
      });
    }
    if(type === 'publish') {
      await moment.publish();
    } else {
      await moment.modifyMoment({
        content,
        resourcesId
      });
    }
    await next();
  })
module.exports = router;