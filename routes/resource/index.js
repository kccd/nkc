const Router = require('koa-router');
const resourceRouter = new Router();
const pathModule = require('path');
resourceRouter
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a resource ID is required.');
    await next()
  })
  .get('/:rid', async (ctx, next) => {
    const {rid} = ctx.params;
    const {data, db, fs, settings} = ctx;
    const {cache} = settings;
    const resource = await db.ResourceModel.findOnly({rid});
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif'];
    if(!extArr.includes(resource.ext.toLowerCase()) && data.userLevel < 1) ctx.throw(403, '只有登录用户可以下载附件，请先登录或者注册。');
    const {path, ext} = resource;
    let filePath = pathModule.join(ctx.settings.upload.uploadPath, path);
    if(extArr.includes(resource.ext.toLowerCase())) {
      try{
        await fs.access(filePath);
      } catch(e) {
      	filePath = ctx.settings.statics.defaultImageResourcePath;
      }
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`)
    }
    ctx.filePath = filePath;
    ctx.resource = resource;
    ctx.type = ext;
    await next()
  })
  .post('/', async (ctx, next) => {
    const {fs} = ctx;
    const {imageMagick} = ctx.tools;
    const settings = ctx.settings;
    const file = ctx.body.files.file;
    if(!file)
      ctx.throw(400, 'no file uploaded');
    const {name, size, path} = file;
    //path "d:\nkc\tmp\upload_0e50089913dcacbc9514f64c3e3d31f4.png"
    // 图片格式 png/jpg
    const extensionE = pathModule.extname(name).replace('.', '');
    const extension = extensionE.toLowerCase()
    // 图片最大尺寸
    const {largeImage} = settings.upload.sizeLimit;
    // 根据自增id定义图片名称
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    // 图片名称279471.png
    const saveName = rid + '.' + extension;
    const {uploadPath, generateFolderName, thumbnailPath} = settings.upload;
    // 图片储存路径 /2018/04/
    const relPath = generateFolderName(uploadPath);
    // 路径 d:\nkc\resources\upload/2018/04/
    const descPath = uploadPath + relPath;
    // 路径+图片名称 d:\nkc\resources\upload/2018/04/279472.png
    const descFile = descPath + saveName;
    if(['jpg', 'jpeg', 'bmp', 'svg', 'png'].indexOf(extension.toLowerCase()) > -1) {
      // 如果格式满足则生成缩略图
      const descPathOfThumbnail = generateFolderName(thumbnailPath); // 存放路径
      const thumbnailFilePath = thumbnailPath + descPathOfThumbnail + saveName; // 路径+名称
      //开始裁剪、压缩
      await imageMagick.thumbnailify(path, thumbnailFilePath);
      // 添加水印
      if(size > largeImage) {
        await imageMagick.attachify(path);
      } else {
        const {width, height} = await imageMagick.info(path);
        if(height > 400 || width > 300) {
          await imageMagick.watermarkify(path);
        }
      }
    }
    await fs.rename(path, descFile);
    const r = new ctx.db.ResourceModel({
      rid,
      oname: name,
      path: relPath + saveName,
      tpath: relPath + saveName,
      ext: extension,
      size,
      uid: ctx.data.user.uid,
      toc: Date.now()
    });
    ctx.data.r = await r.save();
    await next()
  });
module.exports = resourceRouter;