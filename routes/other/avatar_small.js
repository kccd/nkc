const Router = require('koa-router');
const router = new Router();
const {upload, statics} = require('../../settings');
const {avatarSmallPath} = upload;
const {defaultAvatarSmallPath} = statics;
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
      const stat = await fs.stat(url);
      ctx.set('Cache-Control', 'public, no-cache');
      ctx.lastModified = stat.mtime.toUTCString();
      ctx.filePath = url;
    } catch(e) {
      ctx.filePath = defaultAvatarSmallPath;
      ctx.response.lastModified = new Date(1999, 9, 9);
      ctx.set('Cache-Control', 'public, no-cache');
    }
    ctx.type = 'jpg';
    await next()
  });

module.exports = router;