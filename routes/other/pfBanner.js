const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const {upload} = require('../../settings');
const {pfBannerPath, defaultPfBannerPath} = upload;

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a uid is required.');
    await next()
  })
  .get('/:uid', async (ctx, next) => {
    const {fs} = ctx;
    const {uid} = ctx.params;
    try {
      const url = `${pfBannerPath}/${uid}.jpg`;
      await fs.access(url);
      ctx.filePath = url;
    } catch(e) {
      ctx.filePath = defaultPfBannerPath;
    }
    await next()
  })
  .post('/:uid', async (ctx, next) => {
    const {uid} = ctx.params;
    const {data, db, settings, fs} = ctx;
    const {user} = data;
    const targetPersonalForum = await db.PersonalForumModel.findOnly({uid});
    if(user.uid !== uid && !targetPersonalForum.moderators.includes(user.uid)) ctx.throw(401, '权限不足');
    const extArr = ['jpg', 'png', 'jpeg'];
    const {imageMagick} = ctx.tools;
    const file = ctx.body.files.file;
    if(!file) ctx.throw(400, 'no file uploaded');
    const {path, type} = file;
    const extension = mime.getExtension(type);
    if(!extArr.includes(extension)) {
      ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.')
    }
    await imageMagick.bannerify(path);
    const saveName = uid + '.jpg';
    const {pfBannerPath} = settings.upload;
    const targetFile = pfBannerPath +'/'+ saveName;
    await fs.rename(path, targetFile);
    await next();
});

module.exports = router;