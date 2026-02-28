const router = require('koa-router')();
const { settingIds } = require('../../../../settings/serverSettings');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { radioService } = require('../../../../services/radio/radio.service');
const {
  userInfoService,
} = require('../../../../services/user/userInfo.service');
const { Operations } = require('../../../../settings/operations');
router.get(
  '/',
  OnlyOperation(Operations.experimentalRadioSettings),
  async (ctx, next) => {
    const { db } = ctx;
    const radioSettings = await db.SettingModel.getSettings('radio');
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds(
      radioSettings.admin,
    );
    ctx.data.radioSettings = radioSettings;
    ctx.data.adminUsers = [];
    for (const uid of radioSettings.admin) {
      const u = usersObject[uid];
      if (u) {
        ctx.data.adminUsers.push({
          uid,
          username: u.username,
          avatar: u.avatar,
        });
      }
    }
    const radioStations = await radioService.getRadioStations();
    ctx.data.radioStations = radioStations;
    ctx.template = 'experimental/settings/radio/radio.pug';
    await next();
  },
);

router.put(
  '/',
  OnlyOperation(Operations.experimentalRadioSettings),
  async (ctx, next) => {
    const { db } = ctx;
    const { radioSettings, type, stations } = ctx.request.body;
    if (type === 'settings') {
      await db.SettingModel.updateOne(
        { _id: settingIds.radio },
        {
          $set: {
            c: radioSettings,
          },
        },
      );
      await db.SettingModel.saveSettingsToRedis(settingIds.radio);
    } else {
      for (const station of stations) {
        if (!station.name || !station.connection) {
          ctx.throw(400, '请确保所有节点的名称和连接地址都已填写');
        }
      }
      await radioService.updateRadioStations(
        stations.map((s) => ({
          name: s.name,
          connection: s.connection,
          clientType: 'openwebrx',
          disabled: !!s.disabled,
        })),
      );
    }

    await next();
  },
);
module.exports = router;
