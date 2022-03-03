const router = require('koa-router')();
const momentRouter = require('./moment');
router
  .use('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.homeBigLogo = await db.SettingModel.getHomeBigLogo();
    data.managementData = await db.SettingModel.getManagementData(data.user);
    await next();
  })
  .use('/moment', momentRouter.routes(), momentRouter.allowedMethods());
module.exports = router;