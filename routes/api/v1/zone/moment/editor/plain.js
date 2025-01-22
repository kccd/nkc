// 编辑已经发表的电文相关路由
const Router = require('koa-router');
const {
  momentExtenderService,
} = require('../../../../../../services/moment/momentExtender.service');
const {
  OnlyUnbannedUser,
  OnlyUser,
} = require('../../../../../../middlewares/permission');
const router = new Router();
router
  .get('/', OnlyUser(), async (ctx, next) => {
    const { internalData } = ctx;
    const { moment } = internalData;
    ctx.apiData = await momentExtenderService.getPublishedMomentDraft(
      moment._id,
    );
    await next();
  })
  .put('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { internalData, body } = ctx;
    const { moment } = internalData;
    const { content, resourcesId } = body;
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId,
    });
    await next();
  })
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { body, state, internalData, db } = ctx;
    const { moment } = internalData;
    const { content, resourcesId } = body;
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId,
    });
    await moment.publish();
    const newMoment = await db.MomentModel.findOnly({ _id: moment._id });
    const newMomentExtended = await db.MomentModel.extendMomentsListData(
      [newMoment],
      state.uid,
    );
    const newMomentData = newMomentExtended[0];
    ctx.apiData = {
      content: newMomentData.content,
      files: newMomentData.files,
      status: newMomentData.status,
      tlm: newMomentData.tlm,
      addr: newMomentData.addr,
    };
    await next();
  });
module.exports = router;
