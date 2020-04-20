const Router = require('koa-router');
const router = new Router();

router
  .get('/', async (ctx, next) => {
    ctx.template = 'forgotPassword/mobile.pug';
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body, tools} = ctx;
    const {username, mobile, code, password} = body;
    const nationCode = body.nationCode.toString();
    if(!username) ctx.throw(400, '用户名不能为空');
    if(!nationCode) ctx.throw(400, '国际区号不能为空');
    if(!mobile) ctx.throw(400, '手机号码不能为空');
    if(!code) ctx.throw(400, '短信验证码不能为空');
    if(!password) ctx.throw(400, '密码不能为空');
    const type = 'getback';
    const targetUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
    if(!targetUser) ctx.throw(400, '用户名或电话号码错误');
    const targetPersonal = await db.UsersPersonalModel.findOne({uid: targetUser.uid});
    const behaviorOptions = {
      username,
      type: "resetPassword",
      mobile,
      code,
      nationCode,
      password
    };
    await db.AccountBehaviorModel.ensurePermission(behaviorOptions);
    if(!targetPersonal || targetPersonal.nationCode !== nationCode || targetPersonal.mobile !== mobile) {
      await db.AccountBehaviorModel.insertBehavior(behaviorOptions);
      ctx.throw(400, '用户名或电话号码错误');
    }
    let smsCode;
    try{
      smsCode = await db.SmsCodeModel.ensureCode({
        nationCode,
        mobile,
        code,
        type
      });
    } catch(err) {
      await db.AccountBehaviorModel.insertBehavior(behaviorOptions);
      ctx.throw(err);
    }
    const {contentLength, checkPass} = tools.checkString;
    if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位');
    if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者');
    const {apiFunction} = ctx.nkcModules;
    const passwordObj = apiFunction.newPasswordObject(password);
    targetPersonal.password = passwordObj.password;
    targetPersonal.hashType = passwordObj.hashType;
    targetPersonal.secret = passwordObj.secret;
    smsCode.used = true;
    await targetPersonal.save();
    await smsCode.save();
    await next();
  });

module.exports = router;