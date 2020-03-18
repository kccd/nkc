const Router = require('koa-router');
const emailRouter = new Router();
emailRouter
  .get('/', async (ctx, next) => {
    if(ctx.get('FROM') !== 'nkcAPI') {
      ctx.template = 'experimental/settings/email.pug';
      return await next();
    }
    const {data, db} = ctx;
    data.emailSettings = (await db.SettingModel.findOnly({_id: 'email'})).c;
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body} = ctx;
    const {emailSettings} = body;
    const {from, templates, smtpConfig} = emailSettings;
    const {auth, host, port} = smtpConfig;
    const secure = [true, 'true'].includes(smtpConfig.secure);
    smtpConfig.secure = secure;
    const {user, pass} = auth;
    if(!from) ctx.throw(400, '发件人不能为空');
    for(const t of templates) {
      if(t.text === '') ctx.throw(400, `${t.name}模板不能为空`);
    }
    if(host === '') ctx.throw(400, 'host不能为空');
    if(!secure && port === '') ctx.throw(400, '自定义端口不能为空');
    if(!user || !pass) ctx.throw(400, '账号或密码不能为空');
    const emailSettingsDB = await db.SettingModel.findOnly({_id: 'email'});
    await emailSettingsDB.update({c: emailSettings});
    await db.SettingModel.saveSettingsToRedis("email");
    await next();
  })
  .post('/test', async (ctx, next) => {
    const {nkcModules, body} = ctx;
    const {name, email, content} = body;
    const {sendEmail} = nkcModules;
    if(!email) ctx.throw(400, '测试邮箱地址不能为空');
    await sendEmail({
      type: name,
      email: email,
      code: content
    });
    await next();
  });
module.exports = emailRouter;