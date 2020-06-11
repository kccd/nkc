const Router = require('koa-router');
const settingRouter = require('./settings');
const logRouter = require('./log');
const sysInfoRouter = require('./systemInfo');
const consoleRouter = require('./console');
const loginRouter = require("./login");
const toolsRouter = require("./tools");
const experimentalRouter = new Router();
experimentalRouter
  .use("/", async (ctx, next) => {
    const {data, path, db} = ctx;
    if(path === "/e/login") return await next();
    if(!data.user) return ctx.redirect("/login");
    const experimentalSettings = await db.SettingModel.findById('safe');
    const {experimentalVerifyPassword, experimentalTimeout, experimentalPassword} = experimentalSettings.c;
    if(experimentalVerifyPassword) {
      const experimental = ctx.getCookie("experimental");
      if(!experimental) return ctx.redirect("/e/login");
      const {uid, p, secret, time} = experimental;
      const up = await db.UsersPersonalModel.findOne({uid: data.user.uid, secret: p});
      if(
        secret !== experimentalPassword.secret ||
        data.user.uid !== uid ||
        !up ||
        Date.now() - time > experimentalTimeout*60*1000
      ) {
        return ctx.redirect("/e/login");
      }
      ctx.setCookie("experimental", {
        uid,
        p,
        secret,
        time: Date.now()
      });
    }
    await next();
  })
  .get('/', async (ctx) => {
  	return ctx.redirect("/e/console");
  })
  .use('/console', consoleRouter.routes(), consoleRouter.allowedMethods())
	.use('/settings', settingRouter.routes(), settingRouter.allowedMethods())
  .use('/systemInfo', sysInfoRouter.routes(), sysInfoRouter.allowedMethods())
  .use("/login", loginRouter.routes(), loginRouter.allowedMethods())
  .use('/log', logRouter.routes(), logRouter.allowedMethods())
  .use('/tools', toolsRouter.routes(), toolsRouter.allowedMethods());


module.exports = experimentalRouter;
