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
    let stat;
    try {
      const url = `${avatarPath}/${uid}.jpg`;
      stat = await fs.stat(url);
      ctx.response.lastModified = stat.mtime.toUTCString();
      ctx.set('Cache-Control', 'public, no-cache');
      ctx.filePath = url;
    } catch(e) {
      ctx.filePath = defaultAvatarPath;
      ctx.response.lastModified = new Date(1999, 9, 9);
      ctx.set('Cache-Control', 'public, no-cache');
    }
    ctx.type = 'jpg';
    await next()
  })
  .post('/:uid', async (ctx, next) => {
  	const {settings, data, fs, tools, params, body} = ctx;
		const {uid} = params;
		const {user} = data;
		if(!user || uid !== user.uid) ctx.throw(403, '权限不足');
		const {position} = body.fields;
		const {file} = body.files;
	  if(!file) ctx.throw(400, 'no file uploaded');
	  const positionObj = JSON.parse(position);
	  const extArr = ['jpg', 'jpeg', 'png'];
	  const {imageMagick} = tools;
		const {path, type} = file;
		const extension = mime.getExtension(type);
		if(!extArr.includes(extension)) {
			ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.');
		}
		const saveName = uid + '.jpg';
		const {avatarPath, avatarSmallPath} = settings.upload;
		const targetFile = avatarPath + '/' + saveName;
		const targetSmallFile = avatarSmallPath + '/' + saveName;
	  const options = Object.assign({}, positionObj);
	  options.path = path;
	  options.targetPath = targetFile;
	  await imageMagick.avatarify(options);
	  await imageMagick.avatarSmallify(targetFile, targetSmallFile);
	  await fs.unlink(path);
		await next();
  });

module.exports = router;