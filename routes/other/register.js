const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
let apiFn = nkcModules.apiFunction;
let dbFn = nkcModules.dbFunction;
let settings = require('../../settings');
const checkString = require('../../tools/checkString');

const registerRouter = new Router();
registerRouter
  .get(['/','/mobile'], async (ctx, next) => {
    let code = ctx.query.code;
    if(code) {
      ctx.data.regCode = code;
    }
    ctx.data.getCode = false;

    ctx.template = 'interface_user_register.pug';
    await next();
  })
  // 手机注册
  .post('/mobile', async (ctx, next) => {
    let db = ctx.db;
    let params = ctx.body;
    let userObj = {
      username:params.username.trim(),
      password:params.password,
      regCode: params.regCode,
      mobile:params.mobile,
	    nationCode: params.nationCode,
      regIP: ctx.address,
      regPort: ctx.port,
      mcode:params.mcode,
      isA: false
    };
    const regCode = params.regCode;
    let regCodeFoDB = {};
    try{
      regCodeFoDB = await dbFn.checkRegisterCode(regCode);
    }catch (err) {
      ctx.throw('404', err);
    }
    userObj.isA = regCodeFoDB.isA;
    if(checkString.contentLength(userObj.username) > 30) ctx.throw(400, '用于名不能大于30字节(ASCII)');
    if(checkString.contentLength(userObj.password) < 8) ctx.throw(400, '密码长度至少要大于8位');
    if(!checkString.checkPass(userObj.password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者！');
    let usernameOfDBNumber = await dbFn.checkUsername(userObj.username);
    if(usernameOfDBNumber !== 0) ctx.throw(400, '用户名已存在，请更换用户名再试！');
    let mobileCodesNumber = await dbFn.checkMobile(userObj.nationCode, userObj.mobile);
    if(mobileCodesNumber > 0) ctx.throw(400, '此号码已经用于其他用户注册，请检查或更换');
    let smsCode = await dbFn.checkMobileCode(userObj.nationCode, userObj.mobile, userObj.mcode);
    if(!smsCode) ctx.throw(400, '手机验证码错误或过期，请检查');
    await smsCode.update({used: true});
    let newUser = await dbFn.createUser(userObj);
    await dbFn.useRegCode(userObj.regCode, newUser.uid);
    await next();
  })
  .get('/email', async (ctx, next) => {
    let code = ctx.query.code;
    if(code) {
      ctx.data.regCode = code;
    }
    ctx.template = 'interface_user_register2.pug';
    await next();
  })
  // 邮箱注册
  .post('/email', async (ctx, next) => {
    let db = ctx.db;
    let params = ctx.body;
    let userObj = {
      username:params.username,
      password:params.password,
      regCode: params.regCode,
      email:params.email,
      regIP: ctx.address,
      regPort: ctx.port,
      isA: false
    };
    const regCode = params.regCode;
    let regCodeFoDB = {};
    try{
      regCodeFoDB = await dbFn.checkRegisterCode(regCode);
    }catch (err) {
      ctx.throw('404', err);
    }
    userObj.isA = regCodeFoDB.isA;
    if(checkString.contentLength(userObj.username) > 30) ctx.throw(400, '用于名不能大于30字节(ASCII)');
    if(checkString.contentLength(userObj.password) <= 8) ctx.throw(400, '密码长度至少要大于8位');
    if(!checkString.checkPass(userObj.password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者！');
    let usernameOfDBNumber = await dbFn.checkUsername(userObj.username);
    if(usernameOfDBNumber !== 0) ctx.throw(404, '用户名已存在，请更换用户名再试！');
    if(apiFn.checkEmailFormat(userObj.email) === -1) ctx.throw(400, '邮箱格式不正确，请检查');
    let userPersonal = await dbFn.checkEmail(userObj.email);
    if(userPersonal > 0) ctx.throw(404, '此邮箱已注册过，请检查或更换');
    let emailOfDBNumber = await dbFn.checkNumberOfSendEmail(userObj.email);
    if(emailOfDBNumber >= settings.sendMessage.sendEmailCount) ctx.throw(404, '邮件发送次数已达上限，请隔天再试');
    let ecode = apiFn.random(14);
    let passwordObj = apiFn.newPasswordObject(userObj.password);
    userObj.password = passwordObj.password;
    userObj.hashType = passwordObj.hashType;
    userObj.ecode = ecode;
    let emailRegister = new db.EmailRegisterModel(userObj);
    await emailRegister.save();
    let text = '欢迎注册科创论坛，点击以下链接就可以激活您的账户：';
    let href = `http://www.kechuang.org/register/email/verify?email=${userObj.email}&ecode=${ecode}`;
    let link = `<a href="${href}">${href}</a>`;
    await nkcModules.sendEmail({
      to: params.email,
      subject: '注册账户',
      text: text + href,
      html: text + link,
    });
    await next();
  })
  .get('/email/verify', async (ctx, next) => {
    const {data} = ctx;
    const {email, ecode} = ctx.query;
    let userPersonal = await dbFn.checkEmail(email);
    if(userPersonal > 0) ctx.throw('404', '此邮箱已注册过，请检查或更换');
    let emailRegister = await dbFn.checkEmailCode(email, ecode);
    if(!emailRegister) ctx.throw(400, '邮箱链接已失效，请重新注册！');
    let usernameOfDBNumber = await dbFn.checkUsername(emailRegister.username);
    if(usernameOfDBNumber !== 0) ctx.throw('404', '抱歉！该用户名在你激活账户前已经被别人注册了，请更换用户名再试！');
    let newUser = await dbFn.createUser(emailRegister.toObject());
    await dbFn.useRegCode(emailRegister.regCode, newUser.uid);
    await emailRegister.update({used: true});
    data.activeInfo1 = '邮箱注册成功，赶紧登录吧~';
    ctx.template = 'interface_user_login.pug';
    await next();
  });
module.exports = registerRouter;