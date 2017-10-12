const Router = require('koa-router');
const router = new Router();
const routers = require('../tools').requireFolder(__dirname);
const userRouter = routers.user;

router.use('/u', userRouter.routes(), userRouter.allowedMethods());

module.exports = router;