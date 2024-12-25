const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
router.get('/', Public(), async (ctx, next) => {
  const { data } = ctx;
  const { resource } = data;
  let size = 'cover';
  if (resource.mediaType === 'mediaPicture') {
    size = 'sm';
  }
  ctx.remoteFile = await resource.getRemoteFile(size);
  await next();
});
module.exports = router;
