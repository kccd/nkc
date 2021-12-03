const router = require('koa-router')();
const store = require('./router/store');
const get = require('./router/get');
const info = require('./router/info');
const list = require('./router/list');
const metaInformation = require('./router/metaInformation');
const getStorePath = require('./router/getStorePath');
const removeInfo = require('./router/removeInfo');
router
  .get('/', get)
  .post('/', store)
  .get('/info', info)
  .get('/list', list)
  .post('/metaInfo', metaInformation)
  .post('/storePath', getStorePath)
  .put('/removeInfo', removeInfo)

module.exports = router;
