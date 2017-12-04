const Router = require('koa-router');
const mime = require('mime');
const resourceRouter = new Router();
const {promisify} = require('util');
const fs = require('fs');

resourceRouter
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a resource ID is required.');
    await next()
  })
  .get('/:rid', async (ctx, next) => {
    console.log(ctx.type);
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
    if(['jpg', 'jpeg', 'bmp', 'svg', 'png'].indexOf(extension) > -1) {
      if(size > largeImage) {
        await imageMagick.attachify(path)
      } else {
        const {width, height} = await imageMagick.info(path);
        if(height > 400 || width > 300) {
          await imageMagick.watermarkify(path)
        }
      }
    }
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    const saveName = rid + '.' + extension;
    const {uploadPath, generateFolderName} = settings.upload;
    const relPath = generateFolderName();
    const destPath = uploadPath + relPath;
    const destFile = destPath + saveName;
    await promisify(fs.rename)(path, destFile);
    const {ResourceModel} = ctx.db;
    const r = new ResourceModel({
      rid,
      oname: name,
      path: relPath + saveName,
      ext: extension,
      size,
      uid: ctx.data.user.uid,
      toc: Date.now()
    });
    ctx.data.r = await r.save();
    await next()
  })
  .post('/personalForumBanner', async (ctx, next) => {
    const {uid} = ctx.query;
    const {imageMagick} = ctx.tools;
    const settings = ctx.settings;
    const file = ctx.body.files.file;
    if(!file) ctx.throw(400, 'no file uploaded');
    const {name, size, path, type} = file;
    const extension = mime.getExtension(type);
    const {banner} = settings.upload.sizeLimit;
    if(!['jpg', 'png', 'jpeg'].includes(extension)) {
      ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.')
    }
    await imageMagick.bannerify(path);
    const saveName = uid + '.' + extension;
    const {pfBannerPath} = settings.upload;
    const targetFile = pfBannerPath +'/'+ saveName;
    await promisify(fs.rename)(path, targetFile);
    await next();
  });
module.exports = resourceRouter;