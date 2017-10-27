const Router = require('koa-router');
const settings = require('../../settings');
const nkcModules = require('../../nkcModules');
let apiFn = nkcModules.apiFunction;
let dbFn = nkcModules.dbFunction;
const sendMessageRouter = new Router();

sendMessageRouter
  // 手机号码注册
  .post('/register', async (ctx, next) => {
    let db = ctx.db;
    let params = ctx.body;
    let regCode = params.regCode;
    let areaCode = params.areaCode;
    let username = params.username;
    let oldMobile = params.mobile;
    let mobile = (params.areaCode + params.mobile).replace('+', '00');
    if(!mobile) ctx.throw(400, '手机号码不能为空');
    if(!regCode) ctx.throw(400, '注册码不能为空');
    if(!areaCode) ctx.throw(400, '国际区号不能为空');
    let code = apiFn.random(6);
    try{
      await dbFn.checkRigsterCode(regCode);
    }catch (err) {
      ctx.throw('404', err);
    }
    let usernameOfDBNumber = await dbFn.checkUsername(username);
    if(usernameOfDBNumber !== 0) ctx.throw('404', '用户名已存在，请更换用户名再试！');
    //以往的手机号码没有加国际区号，避免老用户用同一个手机号重复注册
    let mobileCodesNumber = await dbFn.checkMobile(mobile, oldMobile);
    if(mobileCodesNumber > 0) ctx.throw(404, '此号码已经用于其他用户注册，请检查或更换');
    let smsCodesNumber = await dbFn.checkNumberOfSendMessage(mobile, 'register');
    if(smsCodesNumber >= settings.sendMessage.sendMobileCodeCount) ctx.throw(404, '短信发送次数已达上限，请隔天再试');
    await settings.mailSecrets.sendSMS(mobile, code , 'register');
    let smsCode = new db.SmsCodeModel({
      mobile: mobile,
      code: code,
      type: 'register'
    });
    await smsCode.save();
    ctx.data.message = '发送成功！';
    await next();
  })
  .post('/reset', async (ctx, next) => {
    ctx.data = '发短信2';
    await next();
  })
  .post('/bindMobile', async (ctx, next) => {
    ctx.data = '发短信3';
    await next();
  });
module.exports = sendMessageRouter;