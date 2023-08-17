const Router = require('koa-router');
const {
  activationCodeService,
} = require('../../../../services/activationCode/activationCode.service');
const { getRegisterExamCheckLock } = require('../../../../nkcModules/redLock');
const router = new Router();
router.get('/exam', async (ctx, next) => {
  const { query, db, address } = ctx;
  const lock = await getRegisterExamCheckLock();
  try {
    const { code: registerActivationCode } = query;
    const { registerExamination } = await db.SettingModel.getSettings(
      'register',
    );
    let isExamRequired = false;
    if (registerExamination) {
      isExamRequired = true;
      if (registerActivationCode) {
        const valid = await activationCodeService.isActivationCodeValid(
          registerActivationCode,
        );
        if (valid) {
          isExamRequired = false;
        }
      }
    }
    ctx.apiData = {
      isExamRequired,
    };
    await lock.unlock();
  } catch (err) {
    await lock.unlock();
    throw err;
  }
  await next();
});
module.exports = router;
