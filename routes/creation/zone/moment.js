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
        const {momentId, videosId, picturesId, content, momentCommentId} = moment;
        data.momentCommentId = momentCommentId;
        data.momentId = momentId;
        data.videosId = videosId;
        data.picturesId = picturesId;
        data.content = content;
      }
      return await next();
    }
    //获取当前用户对动态的审核权限
    const permissions = {
      reviewed: null,
    };
    if(user) {
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.reviewed = true;
      }
    }
    const {normal: normalStatus} = await db.MomentModel.getMomentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    // 获取动态列表
    const match = {
      uid: state.uid,
      parent: '',
      status: normalStatus,
      quoteType: {
        $in: [
          '',
          momentQuoteTypes.moment,
        ]
      }
    };
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match).sort({top: -1}).skip(paging.start).limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(moments, state.uid);
    data.paging = paging;
    data.permissions = permissions;
    await next();
  })
  // 发表动态
  .post('/', async (ctx, next) => {
    const {db, body, state, data} = ctx;
    const {type, content, resourcesId, momentId} = body;
    if(!['create', 'modify', 'publish'].includes(type)) {
      ctx.throw(403, `类型指定错误 type=${type}`);
    }
    if(type === 'create') {
      let moment = await db.MomentModel.getUnPublishedMomentByUid(state.uid);
      if(moment) {
        await moment.modifyMoment({
          content,
          resourcesId,
        });
      } else {
        moment = await db.MomentModel.createMoment({
          ip: ctx.address,
          port: ctx.port,
          content,
          resourcesId,
          uid: state.uid
        });
      }
      data.momentId = moment._id;
    } else if(type === 'modify') {
      const moment = await db.MomentModel.getUnPublishedMomentByMomentId(momentId, state.uid);
      if(moment) {
        await moment.modifyMoment({
          content,
          resourcesId,
        });
      }
    } else {
      const moment = await db.MomentModel.getUnPublishedMomentByMomentId(momentId, state.uid);
      if(!moment) ctx.throw(400, `数据异常 momentId=${momentId}`);
      await moment.modifyMoment({
        content,
        resourcesId,
      });
      await moment.publish();
    }
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
      alsoPost,
      momentCommentId,
    } = body;
    if(!['create', 'modify', 'publish', 'forward'].includes(type)) {
      ctx.throw(403, `类型指定错误 type=${type}`);
    }
    let momentComment;
    if(type === 'create' || type === 'forward') {
      momentComment = await db.MomentModel.getUnPublishedMomentCommentById(state.uid, momentId);
      if(momentComment) {
        await momentComment.modifyMoment({
          content,
          resourcesId: [],
        });
      } else {
        momentComment = await db.MomentModel.createMomentComment({
          ip: ctx.address,
          port: ctx.port,
          content,
          uid: state.uid,
          parent: momentId,
        });
      }
      data.momentCommentId = momentComment._id;
    }

    if(type !== 'create'){
      momentComment = await db.MomentModel.getUnPublishedMomentCommentByCommentId(momentCommentId?momentCommentId: momentComment._id, state.uid, momentId);
      if(!momentComment) ctx.throw(400, `数据异常 momentCommentId=${momentCommentId}`);
      await momentComment.modifyMoment({
        content,
        resourcesId: []
      });
      if(type === 'publish' || type === 'forward') {
        await momentComment.publishMomentComment(postType, alsoPost);
        // data.momentCommentPage = await db.MomentModel.getPageByOrder(momentComment.order);
      }
      data.momentCommentId = momentComment._id;
    }
    await next();
  })
  // 发表评论回复
  .post('/:parent/comment', async (ctx, next) => {
    const {body, db, state, params, nkcModules, data} = ctx;
    const {content} = body;
    const {parent} = params;
    nkcModules.checkData.checkString(content, {
      name: '内容',
      minLength: 1,
      maxLength: 1000,
    });
    const comment = await db.MomentModel.createMomentCommentChildAndPublish({
      ip: ctx.address,
      port: ctx.port,
      uid: state.uid,
      content,
      parent
    });

    data.commentId = comment._id;
    await next();
  })
module.exports = router;
