const router = require('koa-router')();
const store = require('./router/store');
const get = require('./router/get');
const info = require('./router/info');
router
  .get('/', get)
  .post('/', store)
  .get('/info', info)

module.exports = router;