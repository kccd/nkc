const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
const { radioService } = require('../../services/radio/radio.service');

router.get('/permission', Public(), async (ctx, next) => {
  const uid = ctx.state.uid;
  const clientIP = ctx.get('ClientIP');
  const clientPort = Number(ctx.get('ClientPort')) || 0;
  const stationId = ctx.get('DeviceId');
  const radioPermission = await radioService.getUserRadioPermission({
    uid,
    ip: clientIP,
  });
  await radioService.createAccessLog({
    uid,
    ip: clientIP,
    port: clientPort,
    stationId,
  });
  ctx.apiData = {
    uid,
    isAdmin: radioPermission.reasonType === 'adminAllowed',
    permission: radioPermission,
  };
  await next();
});
module.exports = router;
