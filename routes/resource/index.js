const Router = require('koa-router');
const resourceRouter = new Router();
const pathModule = require('path');
const infoRouter = require("./info");
const noticeRouter = require("./notice");
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
  .get('/:rid', async (ctx, next) => {
    const {query, params, data, db, fs, settings, nkcModules} = ctx;
    const {rid} = params;
    const {t, c} = query;
    const {cache} = settings;
    const resource = await db.ResourceModel.findOnly({rid, type: "resource"});
    const {mediaType, ext} = resource;
    const {user} = data;
    let filePath = await resource.getFilePath();
    let speed;
    data.resource = resource;
    data.rid = resource.rid;
    // 开发模式告诉浏览器不要把这次的响应结果缓存下来
    if(!global.NKC.NODE_ENV === 'production') {
      ctx.set("Cache-Control", "no-store");
    }
    if(mediaType === "mediaAttachment") {
      // 获取用户有关下载的时段和数量信息，用户前端展示给用户
      data.fileCountLimitInfo = await db.SettingModel.getDownloadFileCountLimitInfoByUser(data.user);
      const downloadOptions = await db.SettingModel.getDownloadSettingsByUser(data.user);
      // 获取当前时段的最大下载速度
      speed = downloadOptions.speed;
      // 检测 分段下载数量是否超出限制
      await resource.checkDownloadPermission(data.user, ctx.address);
      // 检测 是否需要积分
      const freeTime = 24 * 60 * 60 * 1000;
      const {needScore, reason} = await resource.checkDownloadCost(data.user, freeTime);

      // 因为设置无需积分（与之对应的还有：因为重复下载而不需要积分）
      data.settingNoNeed = !needScore && reason === 'setting';
      // 多长时间以内下载不需要积分
      data.resourceExpired = freeTime;

      data.need = needScore;

      if(needScore) { // 下载需要积分
        // 判断用户积分是否足够
        const {enough, userScores} = await resource.checkUserScore(data.user);
        // 下载需要的积分，用于前端显示提示用户
        data.myAllScore = userScores;
        data.enough = enough;

        data.rid = resource.rid;

        if(c === "query") {
          // 如果只是获取附件和积分相关信息
          return next();
        }
        // 是否需要显示下载扣分询问页面 (c 为 download 就直接扣分并返回文件)
        if(c === "download") {
          // 积分不够，返回错误页面
          if(!data.enough) {
            return nkcModules.throwError(403, "", "scoreNotEnough");
          } else {
            // 扣除积分，继续往下走返回文件
            await db.KcbsRecordModel.insertSystemRecord("attachmentDownload", user, ctx);
          }
        } else if(c === "preview_pdf") {
          const referer = ctx.get('referer');
          if(referer.includes('/reader/pdf/web/viewer')) {
            filePath = await resource.getPDFPreviewFilePath();
          } else {
            return ctx.redirect("/reader/pdf/web/viewer?file=%2fr%2f" + resource.rid + '%3fc%3dpreview_pdf');
          }
        } else {
          // 结束路由，返回页面
          ctx.state.forumsTree = await db.ForumModel.getForumsTree(data.userRoles, data.userGrade, data.user);
          const forumsObj = {};
          ctx.state.forumsTree.map(f => {
            const {categoryId} = f;
            if(!forumsObj[categoryId]) forumsObj[categoryId] = [];
            forumsObj[categoryId].push(f);
          });
          ctx.state.forumCategories = await db.ForumCategoryModel.getCategories();
          ctx.state.userScores = await db.UserModel.getUserScores(data.user.uid);
          ctx.state.categoryForums = [];
          ctx.state.forumCategories.map(fc => {
            const _fc = Object.assign({}, fc);
            const {_id} = _fc;
            _fc.forums = forumsObj[_id] || [];
            if(_fc.forums.length) ctx.state.categoryForums.push(_fc);
          });
          ctx.filePath = null;
          ctx.template = "resource/download.pug";
          return next();
        }
      } else { // 下载不需要积分
        if(c === "query") {
          // 如果只是获取附件和积分相关信息
          return next();
        }
        if(c === "preview_pdf") {
          return ctx.redirect("/reader/pdf/web/viewer?file=%2fr%2f" + resource.rid);
        }
      }

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
    if(t === "attachment") {
      ctx.fileType = "attachment";
    } else if(t === "object") {
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
      // 写入下载记录
      const downloadLog = db.DownloadLogModel({
        uid: data.user? data.user.uid: "",
        ip: ctx.address,
        port: ctx.port,
        rid: resource.rid
      });
      await downloadLog.save();
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
      const resource = await db.ResourceModel.findOne({prid: '', hash: md5, mediaType: "mediaAttachment"});
      if(
        !resource || // 未上传过
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
        global.NKC.io.of('/common').to(`user/${user.uid}`).send({rid: r.rid, state: "fileProcessFinish"});
      } catch(err) {
        console.log(err);
        global.NKC.io.of('/common').to(`user/${user.uid}`).send({err, state: "fileProcessFailed"});
        await r.update({state: 'useless'});
      }
    });
    await next();
  })
  .use("/:rid/info", infoRouter.routes(), infoRouter.allowedMethods())
  .use("/:rid/fileConvertNotice", noticeRouter.routes(), noticeRouter.allowedMethods());

module.exports = resourceRouter;
