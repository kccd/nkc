const Router = require('koa-router');
const settingRouter = new Router();
const forumRouter = require('./forum');
const baseRouter = require('./base');
const roleRouter = require('./role');
const userRouter = require('./user');
const scoreRouter = require('./score');
const operationRouter = require('./operation');
const downloadRouter = require('./download');
const uploadRouter = require('./upload');
const gradeRouter = require('./grade');
const kcbRouter = require('./kcb');
const logRouter = require('./log');
const threadRouter = require("./thread");
const usernameRouter = require("./username");
const homeRouter = require('./home');
const appRouter = require('./app');
const pageRouter = require('./page');
const examRouter = require('./exam');
const messageRouter = require('./message');
const reviewRouter = require("./review");
const hidePostRouter = require("./hidePost");
const shareRouter = require('./share');
const smsRouter = require('./sms');
const postRouter = require('./post');
const xsfRouter = require('./xsf');
const redEnvelopeRouter = require('./redEnvelope');
const emailRouter = require('./email');
const subRouter = require('./sub');
const shopRouter = require('./shop');
const registerRouter = require('./register');
const loginRouter = require("./login");
const authRouter = require("./auth");
const columnRouter = require("./column");
const safeRouter = require('./safe');
const cacheRouter = require("./cache");
const protocolRouter = require('./protocol');
const toppingRouter = require("./topping");
const transferRouter = require("./transfer");
const libraryRouter = require("./library");
const stickerRouter = require("./sticker");
const editorRouter = require("./editor");
const rechargeRouter = require('./recharge');
const userSensitiveRouter = require("./userSensitive");
settingRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
	})
  .use("/transfer", transferRouter.routes(), transferRouter.allowedMethods())
  .use("/hidePost", hidePostRouter.routes(), hidePostRouter.allowedMethods())
  .use("/topping", toppingRouter.routes(), toppingRouter.allowedMethods())
  .use("/cache", cacheRouter.routes(), cacheRouter.allowedMethods())
  .use('/red-envelope', redEnvelopeRouter.routes(), redEnvelopeRouter.allowedMethods())
  .use('/xsf', xsfRouter.routes(), xsfRouter.allowedMethods())
	.use('/post', postRouter.routes(), postRouter.allowedMethods())
	.use('/message', messageRouter.routes(), messageRouter.allowedMethods())
	.use('/share', shareRouter.routes(), shareRouter.allowedMethods())
	.use('/sms', smsRouter.routes(), smsRouter.allowedMethods())
	.use('/home', homeRouter.routes(), homeRouter.allowedMethods())
	.use('/app', appRouter.routes(), appRouter.allowedMethods())
	.use('/page', pageRouter.routes(), pageRouter.allowedMethods())
	.use('/score', scoreRouter.routes(), scoreRouter.allowedMethods())
	.use('/kcb', kcbRouter.routes(), kcbRouter.allowedMethods())
	.use('/grade', gradeRouter.routes(), gradeRouter.allowedMethods())
  .use('/download', downloadRouter.routes(), downloadRouter.allowedMethods())
  .use('/upload', uploadRouter.routes(), uploadRouter.allowedMethods())
	.use('/role', roleRouter.routes(), roleRouter.allowedMethods())
	.use('/base', baseRouter.routes(), baseRouter.allowedMethods())
  .use('/operation', operationRouter.routes(), operationRouter.allowedMethods())
  .use('/log', logRouter.routes(), logRouter.allowedMethods())
	.use('/user', userRouter.routes(), userRouter.allowedMethods())
	.use('/exam', examRouter.routes(), examRouter.allowedMethods())
  .use('/sub', subRouter.routes(), subRouter.allowedMethods())
  .use('/email', emailRouter.routes(), emailRouter.allowedMethods())
	.use('/forum', forumRouter.routes(), forumRouter.allowedMethods())
  .use('/safe', safeRouter.routes(), safeRouter.allowedMethods())
  .use("/auth", authRouter.routes(), authRouter.allowedMethods())
  .use('/register', registerRouter.routes(), registerRouter.allowedMethods())
  .use('/shop', shopRouter.routes(), shopRouter.allowedMethods())
  .use("/review", reviewRouter.routes(), reviewRouter.allowedMethods())
  .use("/column", columnRouter.routes(), columnRouter.allowedMethods())
  .use("/login", loginRouter.routes(), loginRouter.allowedMethods())
  .use("/username", usernameRouter.routes(), usernameRouter.allowedMethods())
  .use("/library", libraryRouter.routes(), libraryRouter.allowedMethods())
	.use("/thread", threadRouter.routes(), threadRouter.allowedMethods())
	.use("/sticker", stickerRouter.routes(), stickerRouter.allowedMethods())
	.use("/editor", editorRouter.routes(), editorRouter.allowedMethods())
	.use('/protocol', protocolRouter.routes(), protocolRouter.allowedMethods())
	.use('/recharge', rechargeRouter.routes(), rechargeRouter.allowedMethods())
	.use('/sensitive', userSensitiveRouter.routes(), userSensitiveRouter.allowedMethods());
module.exports = settingRouter;
