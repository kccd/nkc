const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, db, data, state, nkcModules, permission} = ctx;
    const {user} = data;
    const {from, page, mid} = query;
    // 编辑器获取待发布的动态
    if(from === 'editor') {
      let moment;
      if(mid) {
        moment = await db.MomentModel.getUnPublishedMomentCommentDataById(state.uid, mid);
      } else {
        moment = await db.MomentModel.getUnPublishedMomentDataByUid(state.uid);
      }
      if(moment) {
        const {momentId, videosId, picturesId, content} = moment;
        data.momentId = momentId;
        data.videosId = videosId;
        data.picturesId = picturesId;
        data.content = content;
      }
      return await next();
    }
    const {normal: normalStatus} = await db.MomentModel.getMomentStatus();
    // 获取动态列表
    const match = {
      uid: state.uid,
      parent: '',
      status: normalStatus,
    };
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(moments, state.uid);
    data.paging = paging;
    await next();
  })
  // 发表动态
  .post('/', async (ctx, next) => {
    const {db, body, state, data} = ctx;
    const {type, content, resourcesId} = body;
    if(!['modify', 'publish'].includes(type)) {
      ctx.throw(403, `类型指定错误 type=${type}`);
    }
    let moment = await db.MomentModel.getUnPublishedMomentByUid(state.uid);
    if(!moment) {
      if(content.length > 0) {
        moment = await db.MomentModel.createMoment({
          content,
          resourcesId,
          uid: state.uid
        });
      }
    } else {
      await moment.modifyMoment({
        content,
        resourcesId
      });
      if(type === 'publish') {
        await moment.publish();
      }
    }
    data.momentId = moment? moment._id: '';
    await next();
  })
  // 发表评论
  .post('/:mid', async (ctx, next) => {
    const {db, params, body, state, data} = ctx;
    const {mid: momentId} = params;
    const {
      type,
      content,
      postType,
      alsoPost
    } = body;
    if(!['modify', 'publish'].includes(type)) {
      ctx.throw(403, `类型指定错误 type=${type}`);
    }

    let momentComment = await db.MomentModel.getUnPublishedMomentCommentById(state.uid, momentId);
    if(!momentComment) {
      if(content.length > 0) {
        momentComment = await db.MomentModel.createMomentComment({
          content,
          uid: state.uid,
          parent: momentId,
        });
      }
    } else {
      await momentComment.modifyMoment({
        content,
        resourcesId: []
      });
      if(type === 'publish') {
        await momentComment.publishMomentComment(postType, alsoPost);
        data.momentCommentPage = await db.MomentModel.getPageByOrder(momentComment.order);
      }
    }
    data.momentCommentId = momentComment? momentComment._id: '';
    await next();
  })
module.exports = router;
