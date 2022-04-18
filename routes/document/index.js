const router = require('koa-router')();
const documentRouter=require('./doucment')
router
// .get(':doucmentId', documentRouter.routes(), documentRouter.allowedMethods())
.use('/', documentRouter.routes(), documentRouter.allowedMethods())

module.exports = router;