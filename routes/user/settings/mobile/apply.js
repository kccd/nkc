const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {db, state, data} = ctx;
    const authLevel = await db.UsersPersonalModel.getUserAuthLevel(state.uid);
    data.pendingApplication = !!await db.SecurityApplicationModel.getPendingApplication(state.uid);
    if(authLevel < 1) ctx.throw(403, `你暂未绑定手机号`);
    await next();
  })
  .get('/', async (ctx, next) => {
    const {db, nkcModules, data, state} = ctx;
    const {uid} = state;
    const email = await db.UsersPersonalModel.getUserEmail(uid);
    data.authLevel = await db.UsersPersonalModel.getUserAuthLevel(uid);
    data.bindEmail = !!email;
    ctx.template = 'user/settings/mobile/apply.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {state, db, data, body, nkcModules} = ctx;
    if(data.pendingApplication)  ctx.throw(400, `申请已提交，请耐心等待~ `);
    const {checkString} = nkcModules.checkData;
    const {
      phoneNumber, nationCode, description,
      type, code, password, addresses, verificationRecordId
    } = body;
    const {user} = data;
    await db.VerificationRecordModel.verifyRecord(user.uid, verificationRecordId);
    if(addresses.length < 1) ctx.throw(400, '常用登录地点不能为空');
    if(addresses.length > 3) ctx.throw(400, '常用登录地点不能超过3个');
    for(const a of addresses) {
      checkString(a, {
        name: '常用登录地点',
        minLength: 1,
        maxLength: 50
      });
    }
    if(description && description.length > 1000) ctx.throw(400, '申诉说明不能超过1000字');
    if(!password) ctx.throw(400, '登录密码不能为空');
    if(!await db.UsersPersonalModel.checkUserPassword(user.uid, password)) {
      ctx.throw(400, '登录密码错误');
    }
    delete body.password;
    const samePhoneNumberUser = await db.UsersPersonalModel.findOne({
      mobile: phoneNumber,
      nationCode: nationCode
    });
    if(samePhoneNumberUser) ctx.throw(400, `手机号已被其他用户绑定`);
    const smsObj = {
      nationCode,
      mobile: phoneNumber,
      code,
      type
    };
    const smsCode = await db.SmsCodeModel.ensureCode(smsObj);
    // 标记验证码为已使用
    await smsCode.mark();
    const oldPhoneNumber = await db.UsersPersonalModel.getUserPhoneNumber(user.uid);
    await db.SecurityApplicationModel.createApplication({
      ip: ctx.address,
      port: ctx.port,
      uid: state.uid,
      addresses,
      oldPhoneNumber,
      newPhoneNumber: {
        nationCode,
        number: phoneNumber
      },
      description
    });
    await next();
  });
module.exports = router;
