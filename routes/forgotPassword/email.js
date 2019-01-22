const Router = require('koa-router');
const router = new Router();

router
  .get('/', async (ctx, next) => {
    ctx.template = 'forgotPassword/email.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {tools, db, body, nkcModules} = ctx;
    const {username, email} = body;
    const {checkEmailFormat} = tools.checkString;
    if(!username) ctx.throw(400, '用户名不能为空');
    if(!email) ctx.throw(400, '邮箱地址不能为空');
    if(checkEmailFormat(email) === -1) ctx.throw(400, '邮箱格式不正确');
    const targetUser = await db.UserModel.findOne({username: username});
    if(!targetUser) ctx.throw(400, '用户名或邮箱地址错误');
    const targetPersonal = await db.UsersPersonalModel.findOne({uid: targetUser.uid});
    if(!targetPersonal || targetPersonal.email !== email) ctx.throw(400, '用户名或邮箱地址错误');
    const type = 'getback';
    await db.EmailCodeModel.ensureSendPermission({email, type});
    const token = Math.floor((Math.random()*65536*65536)).toString(16);
    const emailCode = db.EmailCodeModel({
      email,
      token,
      type,
      uid: targetUser.uid
    });
    await emailCode.save();
    await nkcModules.sendEmail({
      email,
      type,
      code: token
    });
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {nkcModules, tools, db, body} = ctx;
    const {username, email, code, password} = body;
    const {checkPass, contentLength, checkEmailFormat} = tools.checkString;
    if(!username) ctx.throw(400, '用户名不能为空');
    if(!email) ctx.throw(400, '邮箱地址不能为空');
    if(checkEmailFormat(email) === -1) ctx.throw(400, '邮箱格式不正确');
    const targetUser = await db.UserModel.findOne({username: username});
    if(!targetUser) ctx.throw(400, '用户名或邮箱地址错误');
    const targetPersonal = await db.UsersPersonalModel.findOne({uid: targetUser.uid});
    if(!targetPersonal || targetPersonal.email !== email) ctx.throw(400, '用户名或邮箱地址错误');
    const type = 'getback';
    const emailCode = await db.EmailCodeModel.ensureEmailCode({
      type,
      email,
      token: code
    });
    if(!password) ctx.throw(400, '新密码不能为空');
    if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位');
    if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
    const passwordObj = nkcModules.apiFunction.newPasswordObject(password);
    targetPersonal.password = passwordObj.password;
    targetPersonal.hashType = passwordObj.hashType;
    emailCode.used = true;
    await targetPersonal.save();
    await emailCode.save();
    await next();
  });

module.exports = router;