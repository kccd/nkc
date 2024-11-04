/*
 * 新发电文、新发电文回复、新发电文回复的回复...相关路由
 * parent参数用于区分是发表电文还是发表电文回复
 *
 */
const Router = require('koa-router');
const {
  momentExtenderService,
} = require('../../../../../services/moment/momentExtender.service');
const { momentModes } = require('../../../../../settings/moment');
const { eventEmitter } = require('../../../../../events');

const { OnlyUser } = require('../../../../../middlewares/permission');
const { getMomentPublishType } = require('../../../../../events/moment');
const router = new Router();

router
  // 获取已存在的草稿
  // 刚打开编辑器，编辑器会尝试从此路由获取之前编辑过但未发表的草稿
  .get('/', OnlyUser(), async (ctx, next) => {
    const { state } = ctx;
    const { parent } = ctx.query;
    const moment = await momentExtenderService.getUnPublishedMomentDataByUid(
      state.uid,
      parent || '',
    );
    if (moment) {
      const { momentId, content, medias } = moment;
      ctx.apiData = {
        momentId: momentId,
        content: content,
        medias: medias,
      };
    } else {
      ctx.apiData = {};
    }
    await next();
  })
  // 判断草稿是否存在，如果不存在则创建，然后再更新草稿
  // 在编辑器中输入了内容后，前端会将新内容提交到此路由
  .put('/', OnlyUser(), async (ctx, next) => {
    const { state, db, body } = ctx;
    const { content, resourcesId, parent } = body;
    let moment = await momentExtenderService.getUnPublishedMomentByUid(
      state.uid,
      momentModes.plain,
      parent,
    );
    if (!moment) {
      // 不存在草稿
      moment = await db.MomentModel.createMoment({
        ip: ctx.address,
        port: ctx.port,
        content,
        resourcesId,
        uid: state.uid,
        parent: parent || '',
      });
    }
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId,
    });
    ctx.apiData = {
      momentId: moment._id,
    };
    await next();
  })
  // 先更新草稿，再发布
  // 在编辑器中点击发表按钮后，前端会将待发表的内容提交到此路由
  .post('/', OnlyUser(), async (ctx, next) => {
    const { state, body } = ctx;
    const { content, resourcesId, parent, postType, alsoPost } = body;
    const moment = await momentExtenderService.getUnPublishedMomentByUid(
      state.uid,
      momentModes.plain,
      parent,
    );
    if (!moment) {
      ctx.throw(400, '提交的内容已过期，请刷新页面后重试');
    }
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId,
    });
    if (!parent) {
      // 发表电文
      await moment.publish();
      const { momentBubble } = getMomentPublishType();
      eventEmitter.emit(momentBubble, {
        uid: state.uid,
        momentId: moment._id,
      });
      ctx.apiData = {
        momentId: moment._id,
      };
    } else {
      // 发表电文回复
      const { repostMomentId } = await moment.publishMomentComment(
        postType,
        alsoPost,
      );
      ctx.apiData = {
        repostMomentId,
        momentId: moment._id,
      };
    }
    await next();
  });
module.exports = router;
