const router = require('koa-router')();
const { userInfoService } = require('../../../services/user/userInfo.service');
const { Public } = require('../../../middlewares/permission');
router.get('/', Public(), async (ctx, next) => {
  const page = Number(ctx.query.page) || 0;
  const type = ctx.query.t;
  const content = ctx.query.c || '';
  const searchOptions = {};
  console.log({ type, content });
  if (type && content) {
    if (type === 'uid') {
      searchOptions.uid = content;
    } else if (type === 'username') {
      const u = await ctx.db.UserModel.findOne({
        usernameLowerCase: content.toLowerCase(),
      });
      searchOptions.uid = u ? u.uid : null;
    } else if (type === 'ip') {
      searchOptions.ip = content;
    } else if (type === 'stationId') {
      searchOptions.stationId = content;
    }
  }
  const perPage = 2;
  const totalCount = await ctx.db.RadioLogModel.countDocuments(searchOptions);
  const paging = await ctx.nkcModules.apiFunction.paging(
    page,
    totalCount,
    perPage,
  );
  const radioLogs = await ctx.db.RadioLogModel.find(searchOptions)
    .sort({ toc: -1 })
    .skip(paging.start)
    .limit(paging.limit)
    .lean();
  const usersId = radioLogs.map((log) => log.uid).filter((uid) => uid);
  const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds(
    usersId,
  );
  const radioSettings = await ctx.db.SettingModel.getSettings('radio');
  const stationsObject = {};
  for (const station of radioSettings.stations) {
    stationsObject[station.id] = station;
  }
  ctx.data.radioLogs = radioLogs.map((log) => {
    const user = usersObject[log.uid] || null;
    const station = stationsObject[log.stationId] || null;
    return {
      ...log,
      user,
      station: station
        ? {
            name: station.name,
            url: `/receiver/${station.id}/`,
          }
        : null,
    };
  });
  ctx.data.paging = paging;
  ctx.data.t = type;
  ctx.data.c = content;
  ctx.template = 'experimental/log/radio/radio.pug';
  await next();
});
module.exports = router;
