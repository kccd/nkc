const Router = require('koa-router');
const router = new Router();
const {
  OnlyUnbannedUser,
  OnlyUser,
} = require('../../../middlewares/permission');
const { ipFinderService } = require('../../../services/ip/ipFinder.service');
router.get('/', OnlyUser(), async (ctx, next) => {
  const { db, data, params, nkcModules } = ctx;
  data.selected = 'security';
  const { uid } = params;
  const userPersonal = await db.UsersPersonalModel.findOnly({ uid });
  data.havePassword = true;
  const { hash, salt } = userPersonal.password;
  if (!hash || !salt) {
    data.havePassword = false;
  }
  let { mobile, nationCode, email, unverifiedEmail, unverifiedMobile } =
    userPersonal;
  if (mobile) {
    mobile = mobile.slice(0, 3) + '****' + mobile.slice(7);
  }
  if (email) {
    email = email.replace(/.{4}@/gi, '****@');
  }
  data.mobile = mobile;
  data.userEmail = email;
  data.nationCode = nationCode;
  data.unverifiedEmail = unverifiedEmail;
  data.unverifiedMobile = unverifiedMobile;
  // 是否需要验证手机号
  data.needPhoneVerify = await db.UsersPersonalModel.shouldVerifyPhoneNumber(
    uid,
  );
  const secret = userPersonal.secret;
  const loginRecordList = await db.LoginRecordModel.find({ uid })
    .sort({ toc: -1 })
    .limit(20);
  data.loginRecordList = [];
  const ipMap = await ipFinderService.getIPInfoMapByIPs(
    loginRecordList.map((item) => item.ip),
  );
  for (const item of loginRecordList) {
    const ipInfo = ipMap.get(item.ip);
    data.loginRecordList.push({
      _id: item._id,
      address: `${item.ip}(${ipInfo.country} ${ipInfo.region} ${ipInfo.city})`,
      userAgent: item.userAgent,
      toc: nkcModules.tools.timeFormat(item.toc),
      status: secret.includes(item._id),
    });
  }
  ctx.template = 'user/settings/security/security.pug';
  await next();
});
module.exports = router;
