const router = require('koa-router')();
const upload = require('./router/upload');
router
  .post('/', upload);

module.exports = router;