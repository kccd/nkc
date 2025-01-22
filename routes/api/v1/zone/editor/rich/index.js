const Router = require('koa-router');
const {
  OnlyUnbannedUser,
  OnlyUser,
} = require('../../../../../../middlewares/permission');
const {
  momentExtenderService,
} = require('../../../../../../services/moment/momentExtender.service');
const { momentModes } = require('../../../../../../settings/moment');
const { getMomentPublishType } = require('../../../../../../events/moment');
const { eventEmitter } = require('../../../../../../events');
const {
  getJsonStringResourcesId,
} = require('../../../../../../nkcModules/json');
const historyRouter = require('./history');
const router = new Router();

router
  .get('/', OnlyUser(), async (ctx, next) => {
    const { state } = ctx;
    const moment =
      await momentExtenderService.getUnPublishedMomentRichDataByUid(state.uid);
    if (moment) {
      const { momentId, content } = moment;
      ctx.apiData = {
        momentId: momentId,
        content: content,
      };
    } else {
      ctx.apiData = {};
    }
    await next();
  })
  .put('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, body, state } = ctx;
    const { content } = body;
    let moment = await momentExtenderService.getUnPublishedMomentByUid(
      state.uid,
      momentModes.rich,
    );
    if (!moment) {
      moment = await db.MomentModel.createMoment({
        ip: ctx.address,
        port: ctx.port,
        content,
        resourcesId: [],
        uid: state.uid,
        parent: '',
        mode: momentModes.rich,
      });
    }
    const resourcesId = getJsonStringResourcesId(content);
    await momentExtenderService.saveRichDraftHistory({
      moment,
      content,
    });
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId: resourcesId,
    });
    ctx.apiData = {
      momentId: moment._id,
    };
    // 暂存草稿
    await next();
  })
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { state, body } = ctx;
    const { content } = body;
    const moment = await momentExtenderService.getUnPublishedMomentByUid(
      state.uid,
      momentModes.rich,
    );
    if (!moment) {
      ctx.throw(400, '提交的内容已过期，请刷新页面后重试');
    }
    const resourcesId = getJsonStringResourcesId(content);
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId: resourcesId,
    });
    await moment.publish();
    const { momentBubble } = getMomentPublishType();
    eventEmitter.emit(momentBubble, {
      uid: state.uid,
      momentId: moment._id,
    });
    ctx.apiData = {
      momentId: moment._id,
    };
    await next();
  });

router.use('/history', historyRouter.routes(), historyRouter.allowedMethods());
module.exports = router;
