const Router = require('koa-router');
const downloadRouter = new Router();
const mediaMethods = require('../resource/methods');
downloadRouter
  .post('/', async (ctx, next) => {
    const {tools, db, data} = ctx;
    const {user} = data;
    const url = ctx.body.loadsrc;
    ctx.data.source = url;
    const file = await tools.downloader(url);
    const {name, size, hash, ext, mediaType, path} = file;
    if(file.ext === "webp") {
      await tools.imageMagick.imageExtTurn(path, path);
    }
    await db.ResourceModel.checkUploadPermission(user, file);
    const extension = ext;
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    const resourceType = 'resource';

    const r = ctx.db.ResourceModel({
      rid,
      type: resourceType,
      oname: name,
      ext: extension,
      size,
      hash,
      uid: ctx.data.user.uid,
      toc: Date.now(),
      mediaType,
      state: 'inProcess'
    });

    await r.save();

    await mediaMethods[mediaType]({
      file,
      user,
      resource: r,
      pictureType: resourceType,
    });

    ctx.data.r = await db.ResourceModel.findOne({rid});
    ctx.data.state = "SUCCESS";
    await next()
  });


module.exports = downloadRouter;
