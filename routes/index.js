const Router = require('koa-router');
const router = new Router();
const routers = require('../requireFolder')(__dirname);
const userRouter = routers.user;
const meRouter = routers.me;
const threadRouter = routers.thread;
const postRouter = routers.post;
const forumRouter = routers.forum;
const otherRouter = routers.other;
const experimentalRouter = routers.experimental;
const questionRouter = routers.question;
const resourceRouter = routers.resource;
const fundRouter = routers.fund;
const registerRouter = routers.register;
const personalForumRouter = routers.personalForum;
const downloadRouter = routers.download;
const systemRouter = routers.system;
const problemRouter = routers.problem;

// 所有请求先经过此中间件
router.use('/', async (ctx, next)  => {
	const {nkcModules, db, data} = ctx;
	const {user} = data;
	const {today} = nkcModules.apiFunction;
	if(user) {
		const toc = Date.now();
		const time = today(toc);
		const dailyLogin = await db.UsersScoreLogModel.findOne({
			uid: user.uid,
			type: 'score',
			operationId: 'dailyLogin',
			toc: {
				$gt: time
			}
		});
		if(!dailyLogin) {
			const log = db.UsersScoreLogModel({
				uid: user.uid,
				toc,
				operationId: 'dailyLogin',
				change: 1,
				type: 'score',
				ip: ctx.address,
				port: ctx.port
			});
			await log.save();
			await user.updateUserMessage();
		}
	}
	await next();
});


router.use('/', otherRouter.routes(), otherRouter.allowedMethods());
router.use('/u', userRouter.routes(), userRouter.allowedMethods());
router.use('/me', meRouter.routes(), meRouter.allowedMethods());
router.use('/t', threadRouter.routes(), threadRouter.allowedMethods());
router.use('/p', postRouter.routes(), postRouter.allowedMethods());
router.use('/f', forumRouter.routes(), forumRouter.allowedMethods());
router.use('/e', experimentalRouter.routes(), experimentalRouter.allowedMethods());
router.use('/q', questionRouter.routes(), questionRouter.allowedMethods());
router.use('/r', resourceRouter.routes(), resourceRouter.allowedMethods());
router.use('/m', personalForumRouter.routes(), personalForumRouter.allowedMethods());
router.use('/fund', fundRouter.routes(), fundRouter.allowedMethods());
router.use('/register', registerRouter.routes(), registerRouter.allowedMethods());
router.use('/download', downloadRouter.routes(), downloadRouter.allowedMethods());
router.use('/problem', problemRouter.routes(), problemRouter.allowedMethods());
router.use('/system', systemRouter.routes(), systemRouter.allowedMethods());
module.exports = router;