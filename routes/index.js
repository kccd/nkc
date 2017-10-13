const Router = require('koa-router');
const router = new Router();
const routers = require('../tools').requireFolder(__dirname);
const userRouter = routers.user;
const meRouter = routers.me;
const threadRouter = routers.thread;

router.use('/u', userRouter.routes(), userRouter.allowedMethods());
router.use('/me', meRouter.routes(), meRouter.allowedMethods());
router.use('/t', threadRouter.routes(), threadRouter.allowedMethods());

module.exports = router;