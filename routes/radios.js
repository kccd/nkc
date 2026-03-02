const router = require('koa-router')();
const { radioService } = require('../services/radio/radio.service');
const { Public } = require('../middlewares/permission');
const { settingIds } = require('../settings/serverSettings');

router.get('/', Public(), async (ctx, next) => {
  const radioSettings = await ctx.db.SettingModel.getSettings(settingIds.radio);
  const radioPermission = await radioService.getUserRadioPermission({
    uid: ctx.state.uid,
    ip: ctx.address,
  });
  if (radioPermission.accessable === false) {
    ctx.data.status = 403;
    ctx.data.error = `${radioPermission.reasonMessage}`;
    ctx.template = 'error/noPermissionToVisitRadios.pug';
    return await next();
  }
  ctx.data.radioName = radioSettings.name;
  ctx.data.radioDescription = radioSettings.description;
  ctx.template = 'radios/radios.pug';
  await next();
});

router.get('/stations', Public(), async (ctx, next) => {
  const radioPermission = await radioService.getUserRadioPermission({
    uid: ctx.state.uid,
    ip: ctx.address,
  });
  if (radioPermission.accessable === false) {
    ctx.throw(403, radioPermission.reasonMessage);
  }
  ctx.apiData = {
    radioStations: (await radioService.getRadioStations()).filter(
      (s) => !s.disabled,
    ),
  };
  await next();
});

module.exports = router;
