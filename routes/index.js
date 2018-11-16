const Router = require('koa-router');
const moment = require('moment');
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
const loginRouter = routers.login;
const appRouter = routers.app;
const messageRouter = routers.message;
const activityRouter = routers.activity;
const friendRouter = routers.friend;
const friendCategoryRouter = routers.friendCategory;
const homeRouter = routers.home;
const shareRouter = routers.share;


// 所有请求先经过此中间件
// 日常登陆
router.use('/', async (ctx, next) => {
  await ctx.db.KcbsRecordModel.insertSystemRecord('dailyLogin', ctx.data.user, ctx);
  await next();
});


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
			await db.UsersScoreLogModel.insertLog({
				user,
				type: 'score',
				typeIdOfScoreChange: 'dailyLogin',
				port: ctx.port,
				ip: ctx.address,
				key: 'dailyLoginCount'
			});
			await user.updateUserMessage();
		}
	}
	await next();
});

router.use('/', homeRouter.routes(), homeRouter.allowedMethods());
router.use('/app', appRouter.routes(), appRouter.allowedMethods());
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
router.use('/login', loginRouter.routes(), loginRouter.allowedMethods());
router.use('/system', systemRouter.routes(), systemRouter.allowedMethods());
router.use('/message', messageRouter.routes(), messageRouter.allowedMethods());
router.use('/activity', activityRouter.routes(),activityRouter.allowedMethods());
router.use('/friend', friendRouter.routes(), friendRouter.allowedMethods());
router.use('/friend_category', friendCategoryRouter.routes(), friendCategoryRouter.allowedMethods());
router.use('/share', shareRouter.routes(), shareRouter.allowedMethods());
module.exports = router;