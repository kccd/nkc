const proxy = require('koa-better-http-proxy');
const router = require('koa-router')();
const { Public } = require('../middlewares/permission');

router.all('/(.*)', Public(), async (ctx) => {
  await proxy('http://localhost:18080')(ctx, () => {});
});

module.exports = router;
