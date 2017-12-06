const Router = require('koa-router');
const resourceRouter = new Router();
const mime = require('mime');
const {promisify} = require('util');
const fs = require('fs');

resourceRouter
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a resource ID is required.');
    await next()
  })
  .get('/:rid', async (ctx, next) => {
    const {rid} = ctx.params;
    const resource = await ctx.db.ResourceModel.findOne({rid});
    const {path, ext} = resource;
    ctx.filePath = ctx.settings.upload.uploadPath + path;
    ctx.type = ext;
    ctx.set('Accept', 'application/*');
    await next()
  })
  .post('/', async (ctx, next) => {
    const {imageMagick} = ctx.tools;
    const settings = ctx.settings;
    const file = ctx.body.files.file;
    if(!file)
      ctx.throw(400, 'no file uploaded');
    const {name, size, path, type} = file;
    const extension = mime.getExtension(type);
    const {largeImage} = settings.upload.sizeLimit;
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    const saveName = rid + '.' + extension;
    const {uploadPath, generateFolderName, thumbnailPath} = settings.upload;
    const relPath = generateFolderName(uploadPath);
    const descPath = uploadPath + relPath;
    const descFile = descPath + saveName;
    if(['jpg', 'jpeg', 'bmp', 'svg', 'png'].indexOf(extension) > -1) {
      // 如果格式满足则生成缩略图
      const descPathOfThumbnail = generateFolderName(thumbnailPath);
      const thumbnailFilePath = thumbnailPath + descPathOfThumbnail + saveName;
      await imageMagick.thumbnailify(path, thumbnailFilePath);
      // 添加水印
      if(size > largeImage) {
        await imageMagick.attachify(path)
      } else {
        const {width, height} = await imageMagick.info(path);
        if(height > 400 || width > 300) {
          await imageMagick.watermarkify(path)
        }
      }
    }
    await promisify(fs.rename)(path, descFile);
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