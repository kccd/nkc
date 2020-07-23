const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const {upload, statics, cache} = require('../../settings');
const {posterPath} = upload;
const {defaultPosterPath} = statics;
router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a posterid is required.');
    await next()
  })
  .get('/:posterid', async (ctx, next) => {
    const {posterid} = ctx.params;
    const {fs} = ctx;
    let stat;
    let url = `${posterPath}/${posterid}.jpg`;
    try {
      stat = await fs.stat(url);
    } catch(e) {
      url = defaultPosterPath;
    } finally {
      ctx.set("Cache-control", `public, max-age=${cache.maxAge}`);
      ctx.filePath = url;
    }
    await next()
  })
  .post('/', async (ctx, next) => {
  	const {settings, data, fs, tools, params, body, fsPromise} = ctx;
    const {user} = data;
    if(!user) ctx.throw(403, '权限不足');
    const {uid} = user;
    const picname = uid + new Date().getTime();
		const {file} = body.files;
	  if(!file) ctx.throw(400, '请上传活动海报');
    const {path, type, size} = file;
	  if(size > 4194304) ctx.throw(400, '图片不能超过4M');
	  let options = {};
	  const extArr = ['jpg', 'jpeg', 'png'];
	  const {imageMagick} = tools;
    const extension = mime.getExtension(type);
	  if(!extArr.includes(extension)) {
		  ctx.throw(400, '图片格式有误，请上传jpg或png格式');
	  }
    const saveName = picname + '.jpg';
    data.picname = picname;
	  const {posterPath, posterSmallPath} = settings.upload;
	  const targetFile = posterPath + '/' + saveName;
	  // const targetSmallFile = posterSmallPath + '/' + saveName;

	  options.path = path;
    options.targetPath = targetFile;
    const { width, height } = await imageMagick.info(path);
    if(parseInt(width) < 540){
      ctx.throw(400, '图片尺寸过小')
    }
    if(parseInt(width) > 1890){
      ctx.throw(400, "图片尺寸过大")
    }


    await fsPromise.copyFile(path, targetFile);
		await next();
  });

module.exports = router;
