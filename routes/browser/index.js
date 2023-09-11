const Router = require('koa-router');
const router = new Router();
const { getUrl } = require('../../nkcModules/tools');
router.get('/', async (ctx, next) => {
  const { data } = ctx;
  data.browsers = [
    {
      logoUrl: getUrl('browserLogo', 'chrome.png'),
      downloadUrl: 'www.google.com/chrome',
      name: 'Chrome',
    },
    {
      logoUrl: getUrl('browserLogo', 'edge.png'),
      downloadUrl: 'https://www.microsoft.com/edge',
      name: 'Edge',
    },
    {
      logoUrl: getUrl('browserLogo', 'firefox.png'),
      downloadUrl: 'https://www.mozilla.org/firefox',
      name: 'Firefox',
    },
  ];
  ctx.remoteTemplate = 'browser/index.pug';
  await next();
});
module.exports = router;
