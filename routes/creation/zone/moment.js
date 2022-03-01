const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, db, data, state} = ctx;
    const {from, page} = query;
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
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, state, data} = ctx;
    const {type, momentId, content, resourcesId} = body;
    let moment;
    data.momentId = momentId;
    if(type === 'create') {
      moment = await db.MomentModel.createMoment({
        content,
        resourcesId,
        uid: state.uid
      });
      data.momentId = moment._id;
    } else if(type === 'modify') {
      const moment = await db.MomentModel.findOnly({_id: momentId});
      await moment.modifyMoment({
        content,
        resourcesId
      });
    }
    await next();
  })
module.exports = router;