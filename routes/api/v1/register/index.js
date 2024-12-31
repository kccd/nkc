const Router = require('koa-router');
const {
  registerExamService,
} = require('../../../../services/register/registerExam.service');
const { getRegisterExamCheckLock } = require('../../../../nkcModules/redLock');
const { Public } = require('../../../../middlewares/permission');

const router = new Router();
router.get('/exam', Public(), async (ctx, next) => {
  const { query, address } = ctx;
  const lock = await getRegisterExamCheckLock(address);
  try {
    const { isExamRequired, isExamEnabled, isValidCode } =
      await registerExamService.getRegisterCodeStatus(query.code);
    if (isExamEnabled) {
      await registerExamService.accessRateLimit(address);
    }
    ctx.apiData = {
      isExamRequired,
      isExamEnabled,
      isValidCode,
    };
    await lock.unlock();
  } catch (err) {
    await lock.unlock();
    throw err;
  }
  await next();
});
module.exports = router;
