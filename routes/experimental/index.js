const Router = require('koa-router');
const settingRouter = require('./settings');
const statusRouter = require('./status');
const logRouter = require('./log');
const sysInfoRouter = require('./systemInfo');
const consoleRouter = require('./console');
const loginRouter = require("./login");
const experimentalRouter = new Router();

experimentalRouter
  .use("/", async (ctx, next) => {
    const {data, path, db} = ctx;
    if(path === "/e/login") return await next();
    if(!data.user) return ctx.redirect("/login");
    const experimentalSettings = await db.SettingModel.findById('safe');
    const {experimentalVerifyPassword, experimentalTimeout} = experimentalSettings.c;
    if(experimentalVerifyPassword) {
      const experimental = ctx.getCookie("experimental");
      if(!experimental) return ctx.redirect("/e/login");
      const {uid, time} = experimental;
      if(data.user.uid !== uid || Date.now() - time > experimentalTimeout*60*1000) return ctx.redirect("/e/login");
      ctx.setCookie("experimental", {
        uid,
        time: Date.now()
      });
    }
    await next();
  })
  .get('/', async (ctx, next) => {
  	return ctx.redirect('/e/status');
  })
	.use('/status', statusRouter.routes(), statusRouter.allowedMethods())
  .use('/console', consoleRouter.routes(), consoleRouter.allowedMethods())
	.use('/settings', settingRouter.routes(), settingRouter.allowedMethods())
  .use('/systemInfo', sysInfoRouter.routes(), sysInfoRouter.allowedMethods())
  .use("/login", loginRouter.routes(), loginRouter.allowedMethods())
  .use('/log', logRouter.routes(), logRouter.allowedMethods());


module.exports = experimentalRouter;