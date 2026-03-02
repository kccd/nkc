const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
const { radioService } = require('../../services/radio/radio.service');

router.get('/permission', Public(), async (ctx, next) => {
  const uid = ctx.state.uid;
  const clientIP = ctx.get('ClientIP');
  const radioPermission = await radioService.getUserRadioPermission({
    uid,
    ip: clientIP,
  });
  ctx.apiData = {
    radioPermission,
  };
  await next();
});
module.exports = router;
