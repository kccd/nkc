const Router = require('koa-router');
const {
  momentExtenderService,
} = require('../../../../../../services/moment/momentExtender.service');
const {
  getJsonStringResourcesId,
} = require('../../../../../../nkcModules/json');
const {
  OnlyUnbannedUser,
} = require('../../../../../../middlewares/permission');
const router = new Router();

router
  .get('/', OnlyUnbannedUser(), async (ctx, next) => {
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
    const { content } = body;
    const resourcesId = getJsonStringResourcesId(content);
    await momentExtenderService.saveRichDraftHistory({
      content,
      moment,
    });
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId: resourcesId,
    });
    ctx.apiData = {
      momentId: moment._id,
    };
    await next();
  })
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { body, internalData } = ctx;
    const { moment } = internalData;
    const { content } = body;
    const resourcesId = getJsonStringResourcesId(content);
    await momentExtenderService.modifyMoment({
      moment,
      content,
      resourcesId: resourcesId,
    });
    await moment.publish();
    ctx.apiData = {
      momentId: moment._id,
    };
    await next();
  });

module.exports = router;
