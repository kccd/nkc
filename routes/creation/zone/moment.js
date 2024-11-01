const router = require('koa-router')();
const { eventEmitter } = require('../../../events');
const { getMomentPublishType } = require('../../../events/moment');
const {
  momentExtenderService,
} = require('../../../services/moment/momentExtender.service');
const { momentModes } = require('../../../settings/moment');
router
  .get('/', async (ctx, next) => {
    const { query, db, data, state, nkcModules, permission, body } = ctx;
    const { user } = data;
    const { from, page, mid } = query;
    // 编辑器获取待发布的动态
    if (from === 'editor') {
      let moment;
      if (mid) {
        //检测一下是否有没有提交的版本
        moment = await db.MomentModel.getUnPublishedMomentCommentDataById(
          state.uid,
          mid,
        );
      } else {
        //暂存的moment
        moment = await momentExtenderService.getUnPublishedMomentDataByUid(
          state.uid,
          momentModes.plain,
        );
      }
      if (moment) {
        const {
          momentId,
          videosId,
          picturesId,
          content,
          momentCommentId,
          medias,
        } = moment;
        data.momentCommentId = momentCommentId;
        data.momentId = momentId;
        data.videosId = videosId;
        data.picturesId = picturesId;
        data.content = content;
        data.medias = medias;
      }
      return await next();
    }
    //获取当前用户对动态的审核权限
    const permissions = {
      reviewed: null,
    };
    if (user) {
      if (permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.reviewed = true;
      }
    }
    const authorMomentStatus = await db.MomentModel.getAuthorMomentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    // 获取动态列表
    const match = {
      uid: state.uid,
      parent: '',
      status: {
        $in: authorMomentStatus,
      },
      quoteType: {
        $in: ['', momentQuoteTypes.moment],
      },
    };
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match)
      .sort({ top: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(
      moments,
      state.uid,
    );
    data.paging = paging;
    data.permissions = permissions;
    await next();
  })
  // 发表动态
  .post('/', async (ctx, next) => {
    const { db, body, state, data } = ctx;
    const { type, content, resourcesId, momentId } = body;
    if (!['create', 'modify', 'publish'].includes(type)) {
      ctx.throw(403, `类型指定错误 type=${type}`);
    }
    if (type === 'create') {
      let moment = await db.MomentModel.getUnPublishedMomentByUid(
        state.uid,
        db.MomentMode.getMomentModes().plain,
      );
      if (moment) {
        await momentExtenderService.modifyMoment({
          moment,
          content,
          resourcesId,
        });
      } else {
        // file==>resourceId可以不放在moment，后期可以优化
        moment = await db.MomentModel.createMoment({
          ip: ctx.address,
          port: ctx.port,
          content,
          resourcesId,
          uid: state.uid,
        });
      }
      data.momentId = moment._id;
    } else if (type === 'modify') {
      const moment = await momentExtenderService.getUnPublishedMomentByMomentId(
        momentId,
        state.uid,
      );
      if (moment) {
        await momentExtenderService.modifyMoment({
          moment,
          content,
          resourcesId,
        });
      }
    } else {
      const moment = await momentExtenderService.getUnPublishedMomentByMomentId(
        momentId,
        state.uid,
      );
      if (!moment) {
        ctx.throw(400, `数据异常 momentId=${momentId}`);
      }
      await momentExtenderService.modifyMoment({
        moment,
        content,
        resourcesId,
      });
      await moment.publish();
      const { momentBubble } = getMomentPublishType();

      await eventEmitter.emit(momentBubble, {
        uid: state.uid,
        momentId,
      });
    }
    await next();
  })
  // 发表评论
  .post('/:mid', async (ctx, next) => {
    const { db, params, body, state, data } = ctx;
    const { mid: momentId } = params;
    const {
      type,
      content,
      postType,
      alsoPost,
      momentCommentId,
      resourcesId = [],
    } = body;
    if (!['create', 'modify', 'publish', 'forward'].includes(type)) {
      ctx.throw(403, `类型指定错误 type=${type}`);
    }
    if (resourcesId.length > 1) {
      ctx.throw(400, `上传图片长度超过最大长度`);
    }
    let momentComment;
    if (type === 'create' || type === 'forward') {
      momentComment = await db.MomentModel.getUnPublishedMomentCommentById(
        state.uid,
        momentId,
      );
      if (momentComment) {
        await momentExtenderService.modifyMoment({
          moment: momentComment,
          content,
          resourcesId,
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

    if (type !== 'create') {
      momentComment =
        await db.MomentModel.getUnPublishedMomentCommentByCommentId(
          momentCommentId ? momentCommentId : momentComment._id,
          state.uid,
          momentId,
        );
      if (!momentComment) {
        ctx.throw(400, `数据异常 momentCommentId=${momentCommentId}`);
      }
      await momentExtenderService.modifyMoment({
        moment: momentComment,
        content,
        resourcesId,
      });
      if (type === 'publish' || type === 'forward') {
        const { repostMomentId } = await momentComment.publishMomentComment(
          postType,
          alsoPost,
        );
        data.repostMomentId = repostMomentId;
        // data.momentCommentPage = await db.MomentModel.getPageByOrder(momentComment.order);
      }
      data.momentCommentId = momentComment._id;
    }
    await next();
  })
  // 发表评论回复
  .post('/:parent/comment', async (ctx, next) => {
    const { body, db, state, params, nkcModules, data } = ctx;
    const { content, resourcesId = [] } = body;
    const { parent } = params;
    const { html } = nkcModules.nkcRender.markNotes.getMark(content);
    nkcModules.checkData.checkString(html, {
      name: '内容',
      minLength: 0,
      maxLength: 1000,
    });
    // 检测文字和图片是否都没有
    if (
      nkcModules.checkData.getLength(html) === 0 &&
      resourcesId.length === 0
    ) {
      ctx.throw(400, `回复内容不能为空`);
    }
    if (resourcesId.length > 1) {
      ctx.throw(400, `上传图片长度超过最大长度`);
    }
    const comment = await db.MomentModel.createMomentCommentChildAndPublish({
      ip: ctx.address,
      port: ctx.port,
      uid: state.uid,
      content: html,
      parent,
      resourcesId,
    });

    data.commentId = comment._id;
    await next();
  });
module.exports = router;
