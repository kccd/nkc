const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
const { radioService } = require('../../services/radio/radio.service');

router.get('/permission', Public(), async (ctx, next) => {
  const uid = ctx.state.uid;
  const radioPermission = await radioService.getUserRadioPermission({
    uid,
    ip: ctx.address,
  });
  ctx.apiData = {
    radioPermission,
  };
  await next();
});
module.exports = router;
