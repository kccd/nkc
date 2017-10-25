const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
let apiFn = nkcModules.apiFunction;
let dbFn = nkcModules.dbFunction;
let settings = require('../../settings');

const registerRouter = new Router();
registerRouter
  .get('/', async (ctx, next) => {
    ctx.redirect('/register/mobile');
    ctx.template = 'interface_user_register.pug';
    await next();
  })
  .get('/mobile', async (ctx, next) => {
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
      username:params.username,
      password:params.password,
      regCode: params.regCode,
      mobile:(params.areaCode + params.mobile).replace('+', '00'),
      regIP: ctx.ip,
      //regPort: ctx.connection.remotePort,
      mcode:params.mcode,
      isA: false
    };
    const regCode = params.regCode;
    let regCodeFoDB = {};
    try{
      regCodeFoDB = await dbFn.checkRigsterCode(regCode);
    }catch (err) {
      ctx.throw('404', err);
    }
    userObj.isA = regCodeFoDB.isA;
    if(apiFn.contentLength(userObj.username) > 30) ctx.throw(400, '用于名不能大于30字节(ASCII)');
    let usernameOfDBNumber = await dbFn.checkUsername(userObj.username);
    if(usernameOfDBNumber !== 0) ctx.throw('404', '用户名已存在，请更换用户名再试！');
    let mobileCodesNumber = await dbFn.checkMobile(userObj.mobile, params.mobile);
    if(mobileCodesNumber > 0) ctx.throw(404, '此号码已经用于其他用户注册，请检查或更换');
    let smsCode = await dbFn.checkMobileCode(userObj.mobile, userObj.mcode);
    if(!smsCode) ctx.throw(404, '手机验证码错误或过期，请检查');
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
      regIP: ctx.ip,
      //regPort: ctx.connection.remotePort,
      isA: false
    };
    const regCode = params.regCode;
    let regCodeFoDB = {};
    try{
      regCodeFoDB = await dbFn.checkRigsterCode(regCode);
    }catch (err) {
      ctx.throw('404', err);
    }
    userObj.isA = regCodeFoDB.isA;
    if(apiFn.contentLength(userObj.username) > 30) ctx.throw(400, '用于名不能大于30字节(ASCII)');
    let usernameOfDBNumber = await dbFn.checkUsername(userObj.username);
    if(usernameOfDBNumber !== 0) ctx.throw('404', '用户名已存在，请更换用户名再试！');
    if(apiFn.checkEmailFormat(userObj.email) === -1) ctx.throw(400, '邮箱格式不正确，请检查');
    let userPersonal = await dbFn.checkEmail(userObj.email);
    if(userPersonal > 0) ctx.throw('404', '此邮箱已注册过，请检查或更换');
    let emailOfDBNumber = await dbFn.checkNumberOfSendEmail(userObj.email);
    if(emailOfDBNumber >= settings.sendMessage.sendEmailCount) ctx.throw('404', '邮件发送次数已达上限，请隔天再试');
    let ecode = apiFn.random(14);
    let salt = Math.floor(Math.random() * 65536).toString(16);
    let hash = apiFn.sha256HMAC(userObj.password, salt);
    userObj.password = {
      salt: salt,
      hash: hash
    };
    userObj.hashType = 'sha256HMAC';
    userObj.ecode = ecode;
    let emailRegister = new db.EmailRegisterModel(userObj);
    await emailRegister.save();
    let text = '欢迎注册科创论坛，点击以下链接就可以激活您的账户：';
    let href = `http://bbs.kechuang.org/register/email/${userObj.email}/${ecode}`;
    let link = `<a href="${href}">${href}</a>`;
    await nkcModules.sendEmail({
      from: settings.mailSecrets.exampleMailOptions.from,
      to: params.email,
      subject: '注册账户',
      text: text + href,
      html: text + link,
    });
    await next();
  })
  .get('/email/:email/:ecode', async (ctx, next) => {
    let db = ctx.db;
    let email = ctx.params.email;
    let ecode = ctx.params.ecode;
    let emailRegister = await dbFn.checkEmailCode(email, ecode);
    if(!emailRegister) ctx.throw(404, '邮箱链接已失效，请重新注册！');
    let userObj = {
      username: emailRegister.username,
      email: emailRegister.email,
      regCode: emailRegister.regCode,
      hashType: emailRegister.hashType,
      isA: emailRegister.isA,
      password: emailRegister.password,
      regIp: ctx.ip
    };
    let newUser = await dbFn.createUser(userObj);
    await dbFn.useRegCode(emailRegister.regCode, newUser.uid);
    ctx.data.activeInfo1 = '邮箱注册成功，赶紧登录吧~';
    ctx.template = 'interface_user_login.pug';
    await next();
  });
module.exports = registerRouter;