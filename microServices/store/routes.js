const router = require('koa-router')();
const store = require('./router/store');
const get = require('./router/get');

router
  .get('/', get)
  .post('/', store)

module.exports = router;