const Router = require('koa-router');
const router = new Router();
const {upload} = require('../../settings');
const {avatarSmallPath, defaultAvatarSmallPath} = upload;
router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a uid is required.');
    await next()
  })
  .get('/:uid', async (ctx, next) => {
    const {fs} = ctx;
    const {uid} = ctx.params;
    try {
      const url = `${avatarSmallPath}/${uid}.jpg`;
      await fs.access(url);
      ctx.filePath = url;
    } catch(e) {
      ctx.filePath = defaultAvatarSmallPath;
    }
    await next()
  });

module.exports = router;