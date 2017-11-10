const Router = require('koa-router');
const router = new Router();
const routers = require('../requireFolder')(__dirname);
const userRouter = routers.user;
const meRouter = routers.me;
const mRouter = routers.m;
const threadRouter = routers.thread;
const postRouter = routers.post;
const forumRouter = routers.forum;
const otherRouter = routers.other;
const experimentalRouter = routers.experimental;
const questionRouter = routers.question;
const resourceRouter = routers.resource;
console.log('bbb')

router.use('/', otherRouter.routes(), otherRouter.allowedMethods());
router.use('/u', userRouter.routes(), userRouter.allowedMethods());
router.use('/me', meRouter.routes(), meRouter.allowedMethods());
//router.use('/m', mRouter.routes(), meRouter.allowedMethods());
router.use('/t', threadRouter.routes(), threadRouter.allowedMethods());
router.use('/p', postRouter.routes(), postRouter.allowedMethods());
router.use('/f', forumRouter.routes(), forumRouter.allowedMethods());
router.use('/e', experimentalRouter.routes(), experimentalRouter.allowedMethods());
router.use('/q', questionRouter.routes(), questionRouter.allowedMethods());
router.use('/r', resourceRouter.routes(), resourceRouter.allowedMethods());
module.exports = router;