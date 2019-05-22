const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const {upload, statics} = require('../../settings');
const {shopLogoPath} = upload;
const {defaultShopLogoPath} = statics;
router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a storeId is required.');
    await next()
  })
  .get('/:storeId', async (ctx, next) => {
    const {storeId} = ctx.params;
    const {fs} = ctx;
    let stat;
    try {
      const url = `${shopLogoPath}/${storeId}.jpg`;
      stat = await fs.stat(url);
      ctx.response.lastModified = stat.mtime.toUTCString();
      ctx.set('Cache-Control', 'public, no-cache');
      ctx.filePath = url;
    } catch(e) {
      ctx.filePath = defaultShopLogoPath;
      ctx.response.lastModified = new Date(1999, 9, 9);
      ctx.set('Cache-Control', 'public, no-cache');
    }
    ctx.type = 'jpg';
    await next()
  })
  .post('/:storeId', async (ctx, next) => {
  	const {settings, data, fs, tools, params, body} = ctx;
		const {storeId} = params;
		const {user} = data;
		const {position} = body.fields;
		const {file} = body.files;
	  if(!file) ctx.throw(400, 'no file uploaded');
	  const {path, type, size} = file;
	  if(size > 81920) ctx.throw(400, '图片大小不得超过80K');
	  const extArr = ['jpg', 'jpeg', 'png'];
	  const {imageMagick} = tools;
	  const extension = mime.getExtension(type);
	  if(!extArr.includes(extension)) {
		  ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.');
	  }
	  const saveName = storeId + '.jpg';
	  const {shopLogoPath} = settings.upload;
	  const targetFile = shopLogoPath + '/' + saveName;
	  await imageMagick.shopLogoify(path, targetFile);
	  await fs.unlink(path);
		await next();
  });

module.exports = router;