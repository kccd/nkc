const Router = require('koa-router');
const resourceRouter = new Router();
const pathModule = require('path');
const infoRouter = require("./info");
const pictureExts = ["jpg", "jpeg", "png", "bmp", "svg", "gif"];
const videoExts = ["mp4", "mov", "3gp", "avi"];
const audioExts = ["wav", "amr", "mp3", "aac"];
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
    const {t} = query;
    const {cache} = settings;
    const resource = await db.ResourceModel.findOnly({rid, type: "resource"});
    const {mediaType, ext} = resource;
    const {user} = data;
    let filePath = await resource.getFilePath();
    let speed;
    if(mediaType === "mediaAttachment") {
      const downloadOptions = await db.SettingModel.getDownloadSettingsByUser(data.user);
      const {fileCountOneDay} = downloadOptions;
      speed = downloadOptions.speed;
      if(fileCountOneDay === 0) {
        if(!data.user) {
          ctx.throw(403, '只有登录用户可以下载附件，请先登录或者注册。');
        } else {
          ctx.throw(403, '您当前账号等级无法下载附件，请发表优质内容提升等级。');
        }
      }
      let downloadToday;
      const match = {
        toc: {
          $gte: nkcModules.apiFunction.today()
        }
      };
      if(!data.user) {
        // 游客
        match.ip = ctx.address;
        match.uid = "";
      } else {
        // 已登录用户
        match.uid = data.user.uid;
      }
      const logs = await db.DownloadLogModel.aggregate([
        {
          $match: match
        },
        {
          $group: {
            _id: "$rid",
            count: {
              $sum: 1
            }
          }
        }
      ]);
      downloadToday = logs?logs.map(l => l._id): [];
      if(!downloadToday.includes(resource.rid) && downloadToday.length >= fileCountOneDay) {
        if(data.user) {
          ctx.throw(403, "今日下载的附件数量已达上限，请明天再试。");
        } else {
          ctx.throw(403, `未登录用户每天只能下载${fileCountOneDay}个附件，请登录或注册后重试。`);
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
      // 下载附件需要的积分
      const operation = await db.SettingModel.getDefaultScoreOperationByType("attachmentDownload");
      // 此用户目前持有的所有积分
      await db.UserModel.updateUserScores(user.uid);
      let myAllScore = await db.UserModel.getUserScores(user.uid);
      // 判断积分是否足够，不够就抛错
      for(let score of myAllScore) {
        if(score.number < operation[score.type]) {
          throwErr(`你的${score.name}不足，无法下载附件。`);
        }
      }
      // 扣除积分
      await db.KcbsRecordModel.insertSystemRecord("attachmentDownload", user, ctx);
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
    const {fs, tools, settings, db, data, nkcModules} = ctx;
    const { imageMagick, ffmpeg } = tools;
    const {upload} = settings;
    const {generateFolderName, extGetPath, thumbnailPath, mediumPath, originPath, frameImgPath} = upload;
    const {user} = data;

    const {websiteName} = await db.SettingModel.getSettings('server');
    let mediaRealPath;
    const {files, fields} = ctx.body;
    const {file} = files;
    const {type, fileName, md5, share} = fields;

    if(type === "checkMD5") {
      // 前端提交待上传文件的md5，用于查找resources里是否与此md5匹配的resource
      // 若不匹配，则返回“未匹配”给前端，前端收到请求后会再次向服务器发起请求，并将待上传的文件上传到服务器。
      // 若匹配，则读取目标resource上的相关信息，并写入到新的resource中。封面图、
      if(!md5) ctx.throw(400, "md5不能为空");
      if(!fileName) ctx.throw(400, "文件名不能为空");
      const resource = await db.ResourceModel.findOne({hash: md5, mediaType: "mediaAttachment"});
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
    let { name, size, path, hash} = file;

    // 检查上传权限

    if(name === "blob" && fileName) {
      name = fileName;
      file.name = fileName;
    }

    await db.ResourceModel.checkUploadPermission(user, file);
    // 获取文件格式 extension
    let extension = await nkcModules.file.getFileExtension(file);
    // 图片最大尺寸
    // const { largeImage } = settings.upload.sizeLimit;
    // 根据自增id定义文件新名称 saveName
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    let saveName = rid + '.' + extension;
    let originId = "";

    // 根据上传类型确定文件保存路径
    // mediaRealPath
    let mediaType;
    if(pictureExts.indexOf(extension.toLowerCase()) > -1) {
      // mediaRealPath = mediaPath + "/picture";
      mediaType = "mediaPicture";
      mediaRealPath = await db.ResourceModel.getMediaPath('mediaPicture');
    }else if(videoExts.indexOf(extension.toLowerCase()) > -1) {
      // mediaRealPath = mediaPath + "/video";
      mediaType = "mediaVideo";
      mediaRealPath = await db.ResourceModel.getMediaPath('mediaVideo');
    }else if(audioExts.indexOf(extension.toLowerCase()) > -1) {
      // mediaRealPath = mediaPath + "/audio";
      mediaType = "mediaAudio";
      mediaRealPath = await db.ResourceModel.getMediaPath('mediaAudio');
    }else{
      // mediaRealPath = mediaPath + "/attachment";
      mediaType = "mediaAttachment";
      mediaRealPath = await db.ResourceModel.getMediaPath('mediaAttachment');
    }

    // 带有年份月份的文件储存路径 /2018/04/
    // const middlePath = generateFolderName(uploadPath);
    let middlePath = generateFolderName(mediaRealPath);
    // 路径 d:\nkc\resources\video/2018/04/256647.mp4
    let mediaFilePath = mediaRealPath + middlePath + saveName;

    // 图片裁剪水印
    if (pictureExts.indexOf(extension.toLowerCase()) > -1) {
      if(type === "sticker") { // 上传的表情图片
        // const { width, height } = await imageMagick.info(path);
        await imageMagick.stickerify(path);
      } else {
        // 如果格式满足则生成缩略图
        const descPathOfThumbnail = generateFolderName(thumbnailPath); // 略缩图存放路径
        const descPathOfMedium = generateFolderName(mediumPath); // 中号图存放路径
        const thumbnailFilePath = thumbnailPath + descPathOfThumbnail + saveName; // 略缩图路径+名称
        const mediumFilePath = mediumPath + descPathOfThumbnail + saveName; // 中号图路径 + 名称
        // 获取原图id
        const originImagePath = await db.ResourceModel.getMediaPath('mediaOrigin');
        const descPathOfOrigin = generateFolderName(originImagePath); // 原图存放路径
        originId = await ctx.db.SettingModel.operateSystemID("originImg", 1);
        let originSaveName = originId + '.' + extension;
        const originFilePath = originImagePath + descPathOfOrigin + originSaveName; // 原图存放路径
        // 图片自动旋转
        await imageMagick.allInfo(path);
        // 获取图片尺寸
        const { width, height } = await imageMagick.info(path);
        // 生成无水印原图
        if(width > 3840 || (size > 5242880 && extension !== "gif")) {
          await imageMagick.originify(path, originFilePath)
        }else{
          await fs.copyFile(path, originFilePath);
        }
        const ro = new ctx.db.OriginImageModel({
          originId,
          path: middlePath + originSaveName,
          tpath: middlePath + originSaveName,
          ext: extension,
          uid: ctx.data.user.uid,
          toc: Date.now()
        });
        ctx.data.ro = await ro.save();
        // 生成略缩图
        if(width > 150 || (size > 51200 && extension !== "gif")) {
          await imageMagick.thumbnailify(path, thumbnailFilePath);
        }else{
          await fs.copyFile(path, thumbnailFilePath);
        }
        // 生成中号图
        if(width > 640 || (size > 102400 && extension !== "gif")) {
          await imageMagick.mediumify(path, mediumFilePath);
        }else{
          await fs.copyFile(path, mediumFilePath)
        }
        // 获取个人水印设置
        const waterSetting = await ctx.db.UsersGeneralModel.findOne({uid: ctx.data.user.uid});
        const waterAdd = waterSetting?waterSetting.waterSetting.waterAdd : true;
        const waterStyle = waterSetting?waterSetting.waterSetting.waterStyle : "siteLogo";
        const waterGravity = waterSetting?waterSetting.waterSetting.waterGravity : "southeast";
        // 获取文字（用户名）水印的字符数、宽度、高度
        let username;
        if(waterStyle === "userLogo"){
          username = ctx.data.user?ctx.data.user.username : websiteName;
        }else if(waterStyle === "coluLogo"){
          const column = await ctx.db.ColumnModel.findOne({uid: ctx.data.user.uid});
          username = column?column.name : ctx.data.user.name+"的专栏";
        }else{
          username = "";
        }
        // const username = ctx.data.user?ctx.data.user.username : websiteName";
        const usernameLength = username.replace(/[^\x00-\xff]/g,"01").length;
        const usernameWidth = usernameLength * 12;
        const usernameHeight = 24;
        // 获取文字（专栏名）水印的字符数、宽度、高度
        // const column = await ctx.db.PersonalForumModel.findOne({uid: ctx.data.user.uid})
        // const coluname = column?column.displayName : username+"的专栏";
        // const colunameLength = coluname.replace(/[^\x00-\xff]/g,"01").length;
        // const colunameWidth = colunameLength * 12;
        // const coluHeight = 24;
        // 获取水印图片路径
        // let waterSmall = await ctx.db.SettingModel.findOne({_id:"home"});
        // waterSmall = waterSmall.c;
        // const waterSmallPath = settings.upload.webLogoPath + "/" + waterSmall.smallLogo + ".png";
        const waterSmallPath = await db.AttachmentModel.getWatermarkFilePath('small');
        const waterBigPath = await db.AttachmentModel.getWatermarkFilePath('normal');
        /*const waterSmallPath = settings.upload.webLogoPath + "/" + waterSmall.smallLogo + ".png";
        const waterBigPath = settings.upload.webLogoPath + "/" + waterSmall.logo + ".png";*/
        // 获取透明度
        // const transparency = waterSmall.watermarkTransparency?waterSmall.watermarkTransparency : "50";
        const watermarkSettings = await db.SettingModel.getWatermarkSettings();
        // 图片水印尺寸
        let {siteLogoWidth, siteLogoHeigth} = await imageMagick.waterInfo(waterSmallPath);
        siteLogoWidth = parseInt(siteLogoWidth);
        siteLogoHeigth = parseInt(siteLogoHeigth);
        // const siteLogoWidth = settings.upload.webSmallLogoSize;
        // const siteLogoHeigth = settings.upload.webSmallLogoSize;
        // 根据水印位置计算偏移量
        let userCoor; // 文字水印偏移量
        let userXcoor = 0; // 文字水印横向偏移量
        let userYcoor = 0; // 文字水印纵向偏移量
        let logoCoor; // Logo水印偏移量
        let logoXcoor = 0; // Logo水印横向偏移量
        let logoYcoor = 0; // Logo水印纵向偏移量
        if(waterGravity === "center"){
          // 正中间，Logo横向负偏移，文字不偏移
          logoCoor = "-"+parseInt(usernameWidth/2+23)+"+0";
          userCoor = "+0+0";
        }else if(waterGravity === "southeast"){
          // 右下角，Logo横向负偏移，文字不偏移
          logoCoor = "+"+parseInt(usernameWidth+10)+"+10"
          userCoor = "+10+"+parseInt(parseInt(siteLogoHeigth-24)/2+10);
        }else if(waterGravity === "southwest"){
          // 左下角，Logo不偏移，文字横向正偏移
          logoCoor = "+10+10";
          userCoor = "+"+parseInt(siteLogoWidth+10)+"+"+parseInt(parseInt(siteLogoHeigth-24)/2+10)
        }else if(waterGravity === "northeast"){
          // 右上角，Logo横向负偏移，文字纵向正偏移
          logoCoor = "+"+parseInt(usernameWidth+10)+"+10"
          userCoor = "+10+"+parseInt(parseInt(siteLogoHeigth-24)/2+10);
        }else if(waterGravity === "northwest"){
          // 左上角，Logo不偏移，文字横向正偏移+纵向正偏移
          logoCoor = "+10+10";
          userCoor = "+"+parseInt(siteLogoWidth+10)+"+"+parseInt(parseInt(siteLogoHeigth-24)/2+10)
        }else{
          logoCoor = "+0+0";
          userCoor = "+0+0"
        }
        // 如果图片宽度大于1920，则将图片宽度缩为1920
        if(size > 500000) {
          await imageMagick.imageNarrow(path);
        }else if(width > 1920) {
          await imageMagick.imageNarrow(path);
        }
        // 如果图片尺寸大于600, 并且用户水印设置为true，则为图片添加水印
        // const homeSettings = await ctx.db.SettingModel.getSettings("home");
        if(extension !== "gif" && width >= watermarkSettings.minWidth && height >= watermarkSettings.minHeight && watermarkSettings.enabled === true && waterAdd){
          if(waterStyle === "siteLogo"){
            await imageMagick.watermarkify(watermarkSettings.transparency, waterGravity, waterBigPath, path)
          }else if(waterStyle === "coluLogo" || waterStyle === "userLogo" || waterStyle === "singleLogo"){
            await imageMagick.watermarkifyLogo(watermarkSettings.transparency, logoCoor, waterGravity, waterSmallPath, path);
            var temporaryPath = extGetPath(extension);
            await imageMagick.watermarkifyFont(userCoor, username, waterGravity, path, temporaryPath);
            // await fs.copyFile(temporaryPath, path);
          }
        }
      }

    }
    // 视频压缩转码
    if (videoExts.indexOf(extension.toLowerCase()) > -1) {
      //
      var timeStr = new Date().getTime();
      // 输出视频路径
      var newpath = pathModule.resolve();
      var outputVideoPath = newpath + "/tmp/" + timeStr + ".mp4";
      // 视频封面图路径
      var videoImgPath = frameImgPath + "/" + rid + ".jpg";

      let {generalSettings} = user;
      let {waterSetting} = generalSettings;
      const watermarkSettings = await db.SettingModel.getWatermarkSettings();
      let ffmpegTransparency = (watermarkSettings.transparency / 100).toFixed(2);

      // 如果设置了需要加水印
      if(waterSetting.waterAdd) {
        let text;
        if(waterSetting.waterStyle === "userLogo"){
          text = ctx.data.user?ctx.data.user.username : websiteName;
        }else if(waterSetting.waterStyle === "coluLogo"){
          const column = await ctx.db.ColumnModel.findOne({uid: ctx.data.user.uid});
          text = column?column.name : ctx.data.user.name+"的专栏";
        }else{
          text = "";
        }
        let waterSmallPath = await db.AttachmentModel.getWatermarkFilePath('small');
        let waterBigPath = await db.AttachmentModel.getWatermarkFilePath('normal');
        path = path.replace(/\\/g, "/");
        outputVideoPath = outputVideoPath.replace(/\\/g, "/");
        // 右下角
        if(waterSetting.waterGravity === "southeast") {
          if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
            await ffmpeg.addImageTextWaterMask({
              input: path,
              output: outputVideoPath,
              image: waterSmallPath,
              text,
              position: {
                x: "W-w-10",
                y: "H-h-10"
              },
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "siteLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterBigPath,
              position: {x: "W-w-10", y: "H-h-10"},
              flex: 0.2,
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "singleLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterSmallPath,
              position: {x: "W-w-10", y: "H-h-10"},
              transparency: ffmpegTransparency
            });
          }
        }
        // 右上角
        if(waterSetting.waterGravity === "northeast") {
          if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
            await ffmpeg.addImageTextWaterMask({
              input: path,
              output: outputVideoPath,
              image: waterSmallPath,
              text,
              position: {
                x: "W-w-10",
                y: "10"
              },
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "siteLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterBigPath,
              position: {x: "W-w-10", y: "10"},
              flex: 0.2,
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "singleLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterSmallPath,
              position: {x: "W-w-10", y: "10"},
              transparency: ffmpegTransparency
            });
          }
        }
        // 左上角
        if(waterSetting.waterGravity === "northwest") {
          if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
            await ffmpeg.addImageTextWaterMask({
              input: path,
              output: outputVideoPath,
              image: waterSmallPath,
              text,
              position: {
                x: "10",
                y: "10"
              },
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "siteLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterBigPath,
              position: {x: "10", y: "10"},
              flex: 0.2,
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "singleLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterSmallPath,
              position: {x: "10", y: "10"},
              transparency: ffmpegTransparency
            });
          }
        }
        // 左下角
        if(waterSetting.waterGravity === "southwest") {
          if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
            await ffmpeg.addImageTextWaterMask({
              input: path,
              output: outputVideoPath,
              image: waterSmallPath,
              text,
              position: {
                x: "10",
                y: "H-h-10"
              },
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "siteLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterBigPath,
              position: {x: "10", y: "H-h-10"},
              flex: 0.2,
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "singleLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterSmallPath,
              position: {x: "10", y: "H-h-10"},
              transparency: ffmpegTransparency
            });
          }
        }
        // 正中间
        if(waterSetting.waterGravity === "center") {
          if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
            await ffmpeg.addImageTextWaterMask({
              input: path,
              output: outputVideoPath,
              image: waterSmallPath,
              text,
              position: {
                x: "(W-w)/2",
                y: "(H-h)/2"
              },
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "siteLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterBigPath,
              position: {
                x: "(W-w)/2",
                y: "(H-h)/2"
              },
              flex: 0.2,
              transparency: ffmpegTransparency
            });
          } else if(waterSetting.waterStyle === "singleLogo") {
            await ffmpeg.addImageWaterMask({
              videoPath: path,
              output: outputVideoPath,
              imagePath: waterSmallPath,
              position: {
                x: "(W-w)/2",
                y: "(H-h)/2"
              },
              transparency: ffmpegTransparency
            });
          }
        }
      } else {
        // 视频转码
        if(['3gp'].indexOf(extension.toLowerCase()) > -1){
          await ffmpeg.video3GPTransMP4(path, outputVideoPath);
        }else if(['mp4'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.videoMP4TransH264(path, outputVideoPath);
        }else if(['mov'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.videoMOVTransMP4(path, outputVideoPath);
        }else if(['avi'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.videoAviTransAvi(path, path);
          await ffmpeg.videoAVITransMP4(path, outputVideoPath);
        }
      }

      // 视频转码
      // if(['3gp'].indexOf(extension.toLowerCase()) > -1){
      //   await ffmpeg.video3GPTransMP4(path, outputVideoPath);
      // }else if(['mp4'].indexOf(extension.toLowerCase()) > -1) {
      //   await ffmpeg.videoMP4TransH264(path, outputVideoPath);
      // }else if(['mov'].indexOf(extension.toLowerCase()) > -1) {
      //   await ffmpeg.videoMOVTransMP4(path, outputVideoPath);
      // }else if(['avi'].indexOf(extension.toLowerCase()) > -1) {
      //   await ffmpeg.videoAviTransAvi(path, path);
      //   await ffmpeg.videoAVITransMP4(path, outputVideoPath);
      // }

      // 将元数据移动到视频的第一帧
      // await ffmpeg.videoMoveMetaToFirstThumb(outputVideoPath, outputVideoPath);
      // 移动已经转好码的视频文件再次移动到tmp临时文件夹下
      await fs.rename(outputVideoPath, path);
      // 生成视频封面图
      await ffmpeg.videoFirstThumbTaker(path, videoImgPath);
      // 修改视频保存信息
      let nameReg = new RegExp(extension, "igm");
      name = name.replace(nameReg, "mp4");
      extension = "mp4";
      saveName = rid + "." + extension;
      mediaFilePath = mediaFilePath.replace(nameReg, "mp4");
    }
    // 音频转为mp3
    if(audioExts.indexOf(extension.toLowerCase()) > -1) {
      const timeStr = Date.now() + "_" + file.hash;
      //输出音频路径
      const newpath = pathModule.resolve();
      const outputVideoPath = newpath + "/tmp/" + timeStr + ".mp3";
      if(['wav'].indexOf(extension.toLowerCase()) > -1) {
        await ffmpeg.audioWAVTransMP3(path, outputVideoPath);
      }else if(['amr'].indexOf(extension.toLowerCase()) > -1) {
        await ffmpeg.audioAMRTransMP3(path, outputVideoPath);
      } else if(['aac'].indexOf(extension.toLowerCase()) > -1) {
        await ffmpeg.audioAACTransMP3(path, outputVideoPath)
      } else {
        await fs.rename(path, outputVideoPath);
      }

      await fs.rename(outputVideoPath, path);
      let nameReg = new RegExp(extension, "igm");
      name = name.replace(nameReg, "mp3");
      extension = "mp3";
      saveName = rid + "." + extension;
      mediaFilePath = mediaFilePath.replace(nameReg, "mp3");
    }
    // await fs.rename(path, mediaFilePath);
    await fs.copyFile(path, mediaFilePath);
    await fs.unlink(path);

    // 判断图片的宽高
    let height, width, resourceType = "resource";
    if(mediaType === "mediaPicture") {
      const pictureInfo = await tools.imageMagick.info(mediaFilePath);
      height = pictureInfo.height;
      width = pictureInfo.width;
      if(type === "sticker") {
        resourceType = type;
      }
    }

    const r = new ctx.db.ResourceModel({
      rid,
      type: resourceType,
      oname: name,
      height,
      width,
      path: middlePath + saveName,
      tpath: middlePath + saveName,
      ext: extension,
      size,
      hash,
      originId,
      uid: ctx.data.user.uid,
      toc: Date.now(),
      mediaType: mediaType
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

    ctx.data.r = await r.save();
    await next()
  })
  .use("/:rid/info", infoRouter.routes(), infoRouter.allowedMethods());

module.exports = resourceRouter;
