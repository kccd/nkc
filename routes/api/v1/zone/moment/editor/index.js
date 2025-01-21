const Router = require('koa-router');
const router = new Router();
const plainRouter = require('./plain');
const richRouter = require('./rich');
const {
  momentExtenderService,
} = require('../../../../../../services/moment/momentExtender.service');
const {
  OnlyUnbannedUser,
} = require('../../../../../../middlewares/permission');
const {
  ThrowBadRequestResponseTypeError,
} = require('../../../../../../nkcModules/error');
const { momentStatus } = require('../../../../../../settings/moment');
const { ResponseTypes } = require('../../../../../../settings/response');

// 编辑电文相关路由的权限判断
// 只有电文的作者才能编辑电文
// 当前路由仅允许编辑已发表的电文
router.use('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { state, params, internalData } = ctx;
  const { momentId } = params;
  const moment = await momentExtenderService.getMomentById(momentId);
  if (state.uid !== moment.uid) {
    ThrowBadRequestResponseTypeError(ResponseTypes.FORBIDDEN);
  } else if (
    ![momentStatus.normal, momentStatus.faulty, momentStatus.unknown].includes(
      moment.status,
    )
  ) {
    ThrowBadRequestResponseTypeError(ResponseTypes.MOMENT_CAN_NOT_BE_EDITED);
  }
  internalData.moment = moment;
  await next();
});
router.use('/plain', plainRouter.routes(), plainRouter.allowedMethods());
router.use('/rich', richRouter.routes(), richRouter.allowedMethods());
module.exports = router;
