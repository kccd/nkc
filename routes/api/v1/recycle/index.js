const router = require('koa-router')();
const recycleBinRouter = require('./recycleBin');
router.use(
  '/recycle-bin',
  recycleBinRouter.routes(),
  recycleBinRouter.allowedMethods(),
);
module.exports = router;
