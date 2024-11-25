const Router = require('koa-router');
const router = new Router();
const richRouter = require('./rich');
const plainRouter = require('./plain');
router.use('/rich', richRouter.routes(), richRouter.allowedMethods());
router.use('/plain', plainRouter.routes(), plainRouter.allowedMethods());
module.exports = router;
