const router = require('koa-router')();
const store = require('./router/store');
const get = require('./router/get');
const info = require('./router/info');
const list = require('./router/list');
router
  .get('/', get)
  .post('/', store)
  .get('/info', info)
  .get('/list', list);

module.exports = router;