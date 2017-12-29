const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const {upload, statics} = require('../../settings');
const {avatarPath} = upload;
const {defaultAvatarPath} = statics;
router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a uid is required.');
    await next()
  })
  .get('/:uid', async (ctx, next) => {
    const {uid} = ctx.params;
    const {fs} = ctx;
    try {
      const url = `${avatarPath}/${uid}.jpg`;
      await fs.access(url);
      ctx.filePath = url;
    } catch(e) {
      ctx.filePath = defaultAvatarPath;
    }
    await next()
  })
  .post('/:uid', async (ctx, next) => {
    const {uid} = ctx.params;
    const {fs} = ctx;
    const {settings, data} = ctx;
    const {user} = data;
    if(uid !== user.uid) ctx.throw(401, '权限不足');
    const extArr = ['jpg', 'png', 'jpeg'];
    const {imageMagick} = ctx.tools;
    const file = ctx.body.files.file;
    if(!file) ctx.throw(400, 'no file uploaded');
    const {path, type} = file;
    const extension = mime.getExtension(type);
    if(!extArr.includes(extension)) {
      ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.')
    }
    await imageMagick.avatarify(path);
    const saveName = uid + '.jpg';
    const {avatarPath, avatarSmallPath} = settings.upload;
    const targetFile = avatarPath + '/' + saveName;
    const targetSmallFile = avatarSmallPath + '/' + saveName;
    await fs.rename(path, targetFile);
    await imageMagick.avatarSmallify(targetFile, targetSmallFile);
    await next();
  });

module.exports = router;