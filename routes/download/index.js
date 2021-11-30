const Router = require('koa-router');
const downloadRouter = new Router();
const mediaMethods = require('../resource/methods');
downloadRouter
  .post('/', async (ctx, next) => {
    const {tools, db, data, nkcModules} = ctx;
    const {user} = data;
    const url = ctx.body.loadsrc;
    ctx.data.source = url;
    const file = await tools.downloader(url);
    const {name, size, hash} = file;

    /*if(file.ext === "webp") {
      await tools.imageMagick.imageExtTurn(path, path);
    }*/

    await db.ResourceModel.checkUploadPermission(user, file);

    const extension = await nkcModules.file.getFileExtension(file);

    const rid = await db.SettingModel.operateSystemID('resources', 1);

    const mediaType = db.ResourceModel.getMediaTypeByExtension(extension);

    const resourceType = 'resource';

    const r = ctx.db.ResourceModel({
      rid,
      type: resourceType,
      oname: name,
      ext: extension,
      size,
      hash,
      uid: user.uid,
      toc: Date.now(),
      mediaType,
      state: 'inProcess'
    });

    await r.save();

    // 将文件推送到 media service
    r.pushToMediaService(file.path)
      .catch(async err => {
        await db.ResourceModel.updateResourceStatus({
          rid,
          status: false,
          error: err.message
        });
      });

    ctx.data.r = r;
    ctx.data.state = "SUCCESS";
    await next()
  });


module.exports = downloadRouter;
