const Router = require('koa-router');
const resourceRouter = new Router();
const pathModule = require('path');
const infoRouter = require("./info");
const payRouter = require("./pay");
const detailRouter = require("./detail");
const mediaMethods = require("./methods");
const {ThrottleGroup} = require("stream-throttle");

// 存放用户设置
const downloadGroups = {};

/*
{
  tg: Object, // 限速
  rate: 2345, // 速度 b
}
*/

resourceRouter
  .use('/:rid', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {rid} = params;
    data.resource = await db.ResourceModel.findOnly({rid, type: "resource"});
    await next();
  })
  .get('/:rid', async (ctx, next) => {
    const {query, data, db, fs, settings, nkcModules} = ctx;
    const {t, c, d} = query;
    const {cache} = settings;
    const {resource} = data;
    const {mediaType, ext} = resource;
    const {user} = data;
    let filePath = await resource.getFilePath(t);
    let speed;
    data.resource = resource;
    data.rid = resource.rid;
    let isPreviewPDF = false;
    if(mediaType === "mediaAttachment") {
      // 获取用户有关下载的时段和数量信息，用户前端展示给用户
      data.fileCountLimitInfo = await db.SettingModel.getDownloadFileCountLimitInfoByUser(data.user);
      const downloadOptions = await db.SettingModel.getDownloadSettingsByUser(data.user);
      // 获取当前时段的最大下载速度
      speed = downloadOptions.speed;

      // 检测 是否需要积分
      const freeTime = 24 * 60 * 60 * 1000;
      const {needScore, reason} = await resource.checkDownloadCost(data.user, freeTime);
      isPreviewPDF = needScore && resource.ext === 'pdf';

      // 非pdf预览或者并且没有下载过，判断下载次数是否足够
      if(
        !(isPreviewPDF || reason === 'repeat')
      ) {
        await resource.checkDownloadPermission(data.user, ctx.address);
      }
      // 下载需要积分，返回预览版
      if(needScore) {
        if(resource.ext !== 'pdf') {
          nkcModules.throwError(403, `当前附件需支付积分后才可下载`);
        } else {
          const pdfPath = await resource.getPDFPreviewFilePath();
          if(!await nkcModules.file.access(pdfPath)) nkcModules.throwError(403, `当前文档暂不能预览`, 'previewPDF');
          filePath = pdfPath;
        }
      }
      // 不要把这次的响应结果缓存下来
      ctx.dontCacheFile = true;
    }
    if (mediaType === "mediaPicture") {
      try {
        await fs.access(filePath);
      } catch (e) {
        filePath = ctx.settings.statics.defaultImageResourcePath;
      }
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`)
    }
    // 在resource中添加点击次数
    if(!ctx.request.headers['range']){
      await resource.update({$inc:{hits:1}});
    }
    ctx.filePath = filePath;
    // 表明客户端希望以附件的形式加载资源
    if(d === "attachment") {
      ctx.fileType = "attachment";
    } else if(d === "object") {
      // 返回数据对象
      data.resource = resource;
      ctx.filePath = undefined;
    }
    ctx.resource = resource;
    ctx.type = ext;

    // 限速
    if(resource.mediaType === "mediaAttachment") {
      let key;
      if(data.user) {
        key = `user_${data.user.uid}`;
      } else {
        key = `ip_${ctx.address}`;
      }
      let speedObj = downloadGroups[key];
      if(!speedObj || speedObj.speed !== speed) {
        speedObj = {
          tg: new ThrottleGroup({rate: speed*1024}),
          speed
        };
        downloadGroups[key] = speedObj;
      }
      ctx.tg = speedObj.tg;
      if(!isPreviewPDF) {
        // 写入下载记录
        const downloadLog = db.DownloadLogModel({
          uid: data.user? data.user.uid: "",
          ip: ctx.address,
          port: ctx.port,
          rid: resource.rid
        });
        await downloadLog.save();
      }
    }
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, data, nkcModules} = ctx;
    const {user} = data;
    const {files, fields} = ctx.body;
    const {file} = files;
    const {type, fileName, md5, share} = fields;
    if(type === "checkMD5") {
      // 前端提交待上传文件的md5，用于查找resources里是否与此md5匹配的resource
      // 若不匹配，则返回“未匹配”给前端，前端收到请求后会再次向服务器发起请求，并将待上传的文件上传到服务器。
      // 若匹配，则读取目标resource上的相关信息，并写入到新的resource中。封面图、
      if(!md5) ctx.throw(400, "md5不能为空");
      if(!fileName) ctx.throw(400, "文件名不能为空");
      const resource = await db.ResourceModel.findOne({
        prid: '',
        hash: md5,
        mediaType: "mediaAttachment",
        state: 'usable'
      }).sort({toc: -1});
      let existed = false;
      if(resource) {
        const filePath = await resource.getFilePath();
        existed = await nkcModules.file.access(filePath);
      }
      if(
        !resource || // 未上传过
        !existed || // 源文件不存在
        !resource.ext // 上传过，但格式丢失
      ) {
        data.uploaded = false;
        return await next();
      }
      // 检测用户上传相关权限
      const _file = {
        size: resource.size,
        ext: resource.ext
      };
      await db.ResourceModel.checkUploadPermission(user, _file);
      // 在此处复制原resource的信息
      const newResource = resource.toObject();
      delete newResource.__v;
      delete newResource._id;
      delete newResource.references;
      delete newResource.tlm;
      delete newResource.originId;
      delete newResource.toc;
      delete newResource.hits;

      newResource.rid = await db.SettingModel.operateSystemID("resources", 1);
      newResource.prid = resource.rid;
      newResource.uid = user.uid;
      newResource.hash = md5;
      newResource.oname = fileName;

      const r = db.ResourceModel(newResource);
      await r.save();
      data.r = r;
      data.uploaded = true;
      return await next();
    }
    if(!file) {
      ctx.throw(400, 'no file uploaded');
    }
    let { name, size, hash} = file;
    // 检查上传权限
    if(name === "blob" && fileName) {
      name = fileName;
      file.name = fileName;
    }
    // 验证上传权限
    await db.ResourceModel.checkUploadPermission(user, file);
    const extension = await nkcModules.file.getFileExtension(file);
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);

    const mediaType = nkcModules.file.getMediaTypeByExtension(extension);

    const resourceType = mediaType === 'mediaPicture' && type === 'sticker'? 'sticker': 'resource';
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

    // 创建表情数据
    if(type === "sticker") {
      if(mediaType !== "mediaPicture") {
        ctx.throw(400, "图片格式错误");
      }
      await db.StickerModel.uploadSticker({
        rid,
        uid: data.user.uid,
        share: !!share
      });
    }
    await r.save();
    ctx.data.r = r;

    setImmediate(async () => {
      try{
        await mediaMethods[mediaType]({
          file,
          user,
          resource: r,
          pictureType: resourceType,
        });
        // 通知前端转换完成了
        ctx.nkcModules.socket.sendDataMessage(user.uid, {
          event: "fileTransformProcess",
          data: {rid: r.rid, state: "fileProcessFinish"}
        });
      } catch(err) {
        console.log(err.stack || err);
        // 通知前端转换失败了
        ctx.nkcModules.socket.sendDataMessage(user.uid, {
          event: "fileTransformProcess",
          data: {err: err.message || err, state: "fileProcessFailed"}
        });
        await r.update({state: 'useless'});
      }
    });
    await next();
  })
  .use("/:rid/info", infoRouter.routes(), infoRouter.allowedMethods())
  .use('/:rid/pay', payRouter.routes(), payRouter.allowedMethods())
  .use('/:rid/detail', detailRouter.routes(), detailRouter.allowedMethods())
module.exports = resourceRouter;
