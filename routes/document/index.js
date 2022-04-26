const router = require('koa-router')();
const documentRouter=require('./doucment')
router
.use('/', documentRouter.routes(), documentRouter.allowedMethods())

module.exports = router;
