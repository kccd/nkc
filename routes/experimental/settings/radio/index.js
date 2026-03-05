const router = require('koa-router')();
const { settingIds } = require('../../../../settings/serverSettings');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { radioService } = require('../../../../services/radio/radio.service');
const {
  userInfoService,
} = require('../../../../services/user/userInfo.service');
const { Operations } = require('../../../../settings/operations');
// 后端同样的最大字数限制
const STATION_NAME_MAX = 64;
const STATION_BRIEF_MAX = 140;
const STATION_DESCRIPTION_MAX = 500;
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
    ctx.template = 'experimental/settings/radio/radio.pug';
    await next();
  },
);

router.post(
  '/check-service',
  OnlyOperation(Operations.experimentalRadioSettings),
  async (ctx, next) => {
    const serviceUrl = ctx.body.serviceUrl;
    if (!serviceUrl) {
      ctx.throw(400, '请提供服务地址');
    }
    try {
      await radioService.checkService(serviceUrl);
      ctx.apiData = {
        status: 'ok',
      };
    } catch (error) {
      ctx.apiData = {
        status: 'error',
        message: `无法连接到服务：${error.message}`,
      };
    }
    await next();
  },
);

router.put(
  '/',
  OnlyOperation(Operations.experimentalRadioSettings),
  async (ctx, next) => {
    const { db } = ctx;
    const { radioSettings } = ctx.request.body;
    for (const station of radioSettings.stations) {
      if (!station.name || !station.connection) {
        ctx.throw(400, '请确保所有站点的名称和连接地址都已填写');
      }
      if (Number(station.maxUsers) < 0) {
        ctx.throw(400, '最大连接数不能小于0');
      }
      if (Number(station.userMaxConnection) < 1) {
        ctx.throw(400, '同一用户最大连接数不能小于1');
      }
      if (station.name && station.name.length > STATION_NAME_MAX) {
        ctx.throw(400, `站点名称不能超过${STATION_NAME_MAX}字`);
      }
      if (station.brief && station.brief.length > STATION_BRIEF_MAX) {
        ctx.throw(400, `站点简介不能超过${STATION_BRIEF_MAX}字`);
      }
      if (
        station.description &&
        station.description.length > STATION_DESCRIPTION_MAX
      ) {
        ctx.throw(400, `站点说明不能超过${STATION_DESCRIPTION_MAX}字`);
      }
    }
    await db.SettingModel.updateOne(
      { _id: settingIds.radio },
      {
        $set: {
          c: radioSettings,
        },
      },
    );
    await db.SettingModel.saveSettingsToRedis(settingIds.radio);
    await radioService.updateRadioStations(
      radioSettings.stations.map((s) => ({
        id: s.id,
        name: s.name,
        brief: s.brief,
        description: s.description,
        connection: s.connection,
        clientType: 'openwebrx',
        disabled: !!s.disabled,
        maxUsers: s.maxUsers,
        userMaxConnection: s.userMaxConnection,
      })),
    );
    await next();
  },
);
module.exports = router;
