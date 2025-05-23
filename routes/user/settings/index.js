const Router = require('koa-router');
const settingRouter = new Router();
const infoRouter = require('./info');
const resumeRouter = require('./resume');
const passwordRouter = require('./password');
const mobileRouter = require('./mobile');
const emailRouter = require('./email');
const verifyRouter = require('./verify');
const transactionRouter = require('./transaction');
const photoRouter = require('./photo');
const certRouter = require('./cert');
const socialRouter = require('./social');
const usernameRouter = require('./username');
const waterRouter = require('./water');
const appsRouter = require('./apps');
const alipayRouter = require('./alipay');
const securityRouter = require('./security');
const bankRouter = require('./bank');
const displayRouter = require('./display');
const redEnvelopeRouter = require('./redEnvelope');
const loginRecordRouter = require('./loginRecord');
const { OnlyUser } = require('../../../middlewares/permission');
settingRouter
  .use('/', OnlyUser(), async (ctx, next) => {
    const { data, params, db, nkcModules } = ctx;
    const { user } = data;
    const { uid } = params;
    if (!user || user.uid !== uid) {
      ctx.throw(403, '权限不足');
    }
    if (!user.username) {
      return ctx.redirect('/register');
    }
    const userPersonal = await db.UsersPersonalModel.findOnly({ uid });
    data.authLevel = await userPersonal.getAuthLevel();
    await next();
  })
  .get(['/', '/info'], OnlyUser(), async (ctx, next) => {
    const { data, db } = ctx;
    const { user } = data;
    data.selected = 'info';
    // 全局用户设置，包括修改用户名需要多少积分
    data.usernameSettings = await db.SettingModel.getSettings('username');
    // 此用户的用户名修改次数
    const generalSettings = await db.UsersGeneralModel.findOne(
      { uid: user.uid },
      {
        modifyUsernameCount: 1,
      },
    );
    data.modifyUsernameCount = generalSettings.modifyUsernameCount;
    // data.user.kcb = await db.UserModel.updateUserKcb(data.user.uid);
    await db.UserModel.updateUserScores(user.uid);
    // 修改用户名需要使用的积分对象
    let scoreObject = await db.SettingModel.getScoreByOperationType(
      'usernameScore',
    );
    // 此用户此类型积分剩余多少
    let myScore = await db.UserModel.getUserScore(user.uid, scoreObject.type);
    // 传递到页面
    data.usernameScore = {
      ...scoreObject,
      number: myScore,
    };
    const auditStatus = db.UserAuditModel.getAuditStatus();
    const userAudit_ = await db.UserAuditModel.findOne({
      uid: user.uid,
      status: auditStatus.pending,
    }).sort({ toc: -1 });
    if (userAudit_) {
      data.userAudit = userAudit_;
    }
    ctx.template = 'interface_user_settings_info.pug';
    await next();
  })
  .use('/apps', appsRouter.routes(), appsRouter.allowedMethods())
  .use('/alipay', alipayRouter.routes(), alipayRouter.allowedMethods())
  .use(
    '/red_envelope',
    redEnvelopeRouter.routes(),
    redEnvelopeRouter.allowedMethods(),
  )
  .use(
    '/transaction',
    transactionRouter.routes(),
    transactionRouter.allowedMethods(),
  )
  .use('/verify', verifyRouter.routes(), verifyRouter.allowedMethods())
  .use('/username', usernameRouter.routes(), usernameRouter.allowedMethods())
  .use('/resume', resumeRouter.routes(), resumeRouter.allowedMethods())
  .use('/password', passwordRouter.routes(), passwordRouter.allowedMethods())
  .use('/social', socialRouter.routes(), socialRouter.allowedMethods())
  .use('/mobile', mobileRouter.routes(), mobileRouter.allowedMethods())
  .use('/email', emailRouter.routes(), emailRouter.allowedMethods())
  .use('/cert', certRouter.routes(), certRouter.allowedMethods())
  .use('/photo', photoRouter.routes(), photoRouter.allowedMethods())
  .use('/', infoRouter.routes(), infoRouter.allowedMethods())
  .use('/display', displayRouter.routes(), displayRouter.allowedMethods())
  .use('/bank', bankRouter.routes(), bankRouter.allowedMethods())
  .use('/security', securityRouter.routes(), securityRouter.allowedMethods())
  .use('/water', waterRouter.routes(), waterRouter.allowedMethods())
  .use(
    '/loginRecord',
    loginRecordRouter.routes(),
    loginRecordRouter.allowedMethods(),
  );
module.exports = settingRouter;
