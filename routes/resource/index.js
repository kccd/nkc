const Router = require('koa-router');
const resourceRouter = new Router();
const pathModule = require('path');
const util = require("util");
const pictureExts = ["jpg", "jpeg", "png", "bmp", "svg", "gif"];
const videoExts = ["mp4", "mov", "3gp", "avi"];
const audioExts = ["wav", "amr"];
resourceRouter
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a resource ID is required.');
    await next()
  })
  .get('/:rid', async (ctx, next) => {
    // const { rid } = ctx.params;
    // const { data, db, fs, settings } = ctx;
    // const { cache } = settings;
    // const resource = await db.ResourceModel.findOnly({ rid });
    // const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif', 'mp4', '3gp', 'swf'];
    // if (!extArr.includes(resource.ext.toLowerCase()) && !data.user) ctx.throw(403, '只有登录用户可以下载附件，请先登录或者注册。');
    // // if (extArr.includes(resource.ext.toLowerCase()) && resource.references.length == 0 && (!data.user || data.user && data.user.uid !== resource.uid)) ctx.throw(403, '图片未发表在文章中，不可查看');
    // const { path, ext } = resource;
    // let filePath = pathModule.join(ctx.settings.upload.uploadPath, path);
    // if (extArr.includes(resource.ext.toLowerCase())) {
    //   try {
    //     await fs.access(filePath);
    //   } catch (e) {
    //     filePath = ctx.settings.statics.defaultImageResourcePath;
    //   }
    //   ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`)
    // }
    // // 在resource中添加点击次数
    // await resource.update({$inc:{hits:1}})
    // ctx.filePath = filePath;
    // ctx.resource = resource;
    // ctx.type = ext;
    // await next()
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif', 'mp4', '3gp', 'swf'];
    const { rid } = ctx.params;
    const { data, db, fs, settings } = ctx;
    const { cache } = settings;
    const {mediaPath} = settings.upload;
    const {mediaPicturePath, mediaVideoPath, mediaAudioPath, mediaAttachmentPath, selectDiskCharacterUp, selectDiskCharacterDown} = settings.mediaPath;
    const resource = await db.ResourceModel.findOnly({ rid });
    const { path, ext } = resource;
    let filePath = selectDiskCharacterDown(resource);
    filePath = filePath + path;
    if (!extArr.includes(resource.ext.toLowerCase()) && !data.user) ctx.throw(403, '只有登录用户可以下载附件，请先登录或者注册。');
    if (extArr.includes(resource.ext.toLowerCase())) {
      try {
        await fs.access(filePath);
      } catch (e) {
        filePath = ctx.settings.statics.defaultImageResourcePath;
      }
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`)
    }
    // 在resource中添加点击次数
    await resource.update({$inc:{hits:1}})
    ctx.filePath = filePath;
    ctx.resource = resource;
    ctx.type = ext;
    await next()
  })
  .post('/', async (ctx, next) => {
    const { fs } = ctx;
    const { imageMagick, ffmpeg } = ctx.tools;
    const settings = ctx.settings;
    const { largeImage, upload } = settings.upload.sizeLimit;
    const { mediaPath, uploadPath, generateFolderName, thumbnailPath, frameImgPath} = settings.upload;
    const {selectDiskCharacterUp} = settings.mediaPath;
    
    let mediaRealPath;
    const file = ctx.body.files.file;
    if(!file) {
      ctx.throw(400, 'no file uploaded');
    }
    let { name, size, path } = file;
    // 获取文件格式 extension
    const extensionE = pathModule.extname(name).replace('.', '');
    let extension = extensionE.toLowerCase();
    // 图片最大尺寸
    // const { largeImage } = settings.upload.sizeLimit;
    // 根据自增id定义文件新名称 saveName
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    let saveName = rid + '.' + extension;

    // 根据上传类型确定文件保存路径
    // mediaRealPath
    let mediaType;
    if(pictureExts.indexOf(extension.toLowerCase()) > -1) {
      // mediaRealPath = mediaPath + "/picture";
      mediaRealPath = selectDiskCharacterUp("mediaPicture");
      mediaType = "mediaPicture";
    }else if(videoExts.indexOf(extension.toLowerCase()) > -1) {
      // mediaRealPath = mediaPath + "/video";
      mediaRealPath = selectDiskCharacterUp("mediaVideo");
      mediaType = "mediaVideo";
    }else if(audioExts.indexOf(extension.toLowerCase()) > -1) {
      // mediaRealPath = mediaPath + "/audio";
      mediaRealPath = selectDiskCharacterUp("mediaAudio");
      mediaType = "mediaAudio";
    }else{
      // mediaRealPath = mediaPath + "/attachment";
      mediaRealPath = selectDiskCharacterUp("mediaAttachment");
      mediaType = "mediaAttachment";
    }
    // 带有年份月份的文件储存路径 /2018/04/
    // const middlePath = generateFolderName(uploadPath);
    let middlePath = generateFolderName(mediaRealPath);
    // 路径 d:\nkc\resources\video/2018/04/256647.mp4
    let mediaFilePath = mediaRealPath + middlePath + saveName;

    // 图片裁剪水印
    if (['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'].indexOf(extension.toLowerCase()) > -1) {
      // 如果格式满足则生成缩略图
      const descPathOfThumbnail = generateFolderName(thumbnailPath); // 存放路径
      const thumbnailFilePath = thumbnailPath + descPathOfThumbnail + saveName; // 路径+名称

      // 图片自动旋转
      try{
        await imageMagick.allInfo(path);
      }catch(e){
        mediaRealPath = selectDiskCharacterUp("mediaAttachment");
        middlePath = generateFolderName(mediaRealPath);
        mediaFilePath = mediaRealPath + middlePath + saveName;
        await fs.copyFile(path, mediaFilePath);
        await fs.unlink(path);
        const r = new ctx.db.ResourceModel({
          rid,
          oname: name,
          path: middlePath + saveName,
          tpath: middlePath + saveName,
          ext: extension,
          size,
          uid: ctx.data.user.uid,
          toc: Date.now(),
          mediaType: "mediaAttachment"
        });
        ctx.data.r = await r.save();
        ctx.throw(400, "图片上传失败，已被放至附件")
        return await next()
      }

      // 生成略缩图
      await imageMagick.thumbnailify(path, thumbnailFilePath);
      // 获取个人水印设置
      const waterSetting = await ctx.db.UsersGeneralModel.findOne({uid: ctx.data.user.uid});
      const waterAdd = waterSetting?waterSetting.waterSetting.waterAdd : true;
      const waterStyle = waterSetting?waterSetting.waterSetting.waterStyle : "siteLogo";
      const waterGravity = waterSetting?waterSetting.waterSetting.waterGravity : "southeast";
      // 获取文字（用户名）水印的字符数、宽度、高度
      let username;
      if(waterStyle === "userLogo"){
        username = ctx.data.user?ctx.data.user.username : "科创论坛";
      }else if(waterStyle === "coluLogo"){
        const column = await ctx.db.PersonalForumModel.findOne({uid: ctx.data.user.uid});
        username = column?column.displayName : ctx.data.user.username+"的专栏";
      }else{
        username = "";
      }
      // const username = ctx.data.user?ctx.data.user.username : "科创论坛";
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
      const waterSmall = await ctx.db.SettingModel.findOne({type:"home"});
      // const waterSmallPath = settings.upload.webLogoPath + "/" + waterSmall.smallLogo + ".png";
      const waterSmallPath = settings.upload.webLogoPath + "/" + waterSmall.smallLogo + ".png";
      const waterBigPath = settings.upload.webLogoPath + "/" + waterSmall.logo + ".png";
      // 获取透明度
      const transparency = waterSmall.watermarkTransparency?waterSmall.watermarkTransparency : "50";
      // 图片水印尺寸
      let {siteLogoWidth, siteLogoHeigth} = await imageMagick.waterInfo(waterSmallPath);
      siteLogoWidth = parseInt(siteLogoWidth);
      siteLogoHeigth = parseInt(siteLogoHeigth)
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
      // 获取图片尺寸
      const { width, height } = await imageMagick.info(path);
      // 如果图片宽度大于1024，则将图片宽度缩为1024
      if(width > 1920 && size > largeImage){
        await imageMagick.imageNarrow(path)
      }
      // 如果图片尺寸大于600, 并且用户水印设置为true，则为图片添加水印
      if(width > 600 && height > 200 && waterAdd === true){
        if(waterStyle === "siteLogo"){
          await imageMagick.watermarkify(transparency, waterGravity, waterBigPath, path)
        }else if(waterStyle === "coluLogo" || waterStyle === "userLogo" || waterStyle === "singleLogo"){
          await imageMagick.watermarkifyLogo(logoCoor, waterGravity, waterSmallPath, path)
          await imageMagick.watermarkifyFont(userCoor, username, waterGravity, path)
        }
      }
      // console.log(width>1024)
      // await imageMagick.imageTest(path);
      // await imageMagick.watermarkify(path);
      // console.log(largeImage)
      // if (size > largeImage) {
      //   await imageMagick.attachify(path);
      // } else {
      //   const { width, height } = await imageMagick.info(path);
      //   if (height > 400 || width > 300) {
      //     if(waterAdd === true){
      //       console.log(path)
      //       await imageMagick.watermarkify(path);
      //       await imageMagick.watermarkifyFont(waterGravity,path);
      //     }
      //   }
      // }
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

      try{
        if(['3gp'].indexOf(extension.toLowerCase()) > -1){
          await ffmpeg.video3GPTransMP4(path, outputVideoPath);
        }else if(['mp4'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.videoMP4TransH264(path, outputVideoPath);
        }else if(['mov'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.videoMOVTransMP4(path, outputVideoPath);
        }else if(['avi'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.videoAVITransMP4(path, outputVideoPath);
        }
      }catch(e) {
        mediaRealPath = selectDiskCharacterUp("mediaAttachment");
        middlePath = generateFolderName(mediaRealPath);
        mediaFilePath = mediaRealPath + middlePath + saveName;
        await fs.copyFile(path, mediaFilePath);
        await fs.unlink(path);
        const r = new ctx.db.ResourceModel({
          rid,
          oname: name,
          path: middlePath + saveName,
          tpath: middlePath + saveName,
          ext: extension,
          size,
          uid: ctx.data.user.uid,
          toc: Date.now(),
          mediaType: "mediaAttachment"
        });
        ctx.data.r = await r.save();
        ctx.throw(400, "视频转码失败，已被放至附件")
        return await next()
      }

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
      mediaFilePath = mediaFilePath.replace(nameReg, "mp4")
    } 
    // 音频转为mp3
    if(audioExts.indexOf(extension.toLowerCase()) > -1) {
      var timeStr = new Date().getTime();
      //输出音频路径
      var newpath = pathModule.resolve();
      var outputVideoPath = newpath + "/tmp/" + timeStr + ".mp3";
      try{
        if(['wav'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.audioWAVTransMP3(path, outputVideoPath);
        }else if(['amr'].indexOf(extension.toLowerCase()) > -1) {
          await ffmpeg.audioAMRTransMP3(path, outputVideoPath);
        }
      }catch(e) {
        mediaRealPath = selectDiskCharacterUp("mediaAttachment");
        middlePath = generateFolderName(mediaRealPath);
        mediaFilePath = mediaRealPath + middlePath + saveName;
        await fs.copyFile(path, mediaFilePath);
        await fs.unlink(path);
        const r = new ctx.db.ResourceModel({
          rid,
          oname: name,
          path: middlePath + saveName,
          tpath: middlePath + saveName,
          ext: extension,
          size,
          uid: ctx.data.user.uid,
          toc: Date.now(),
          mediaType: "mediaAttachment"
        });
        ctx.data.r = await r.save();
        ctx.throw(400, "音频转码失败，已被放至附件")
        return await next()
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
    const r = new ctx.db.ResourceModel({
      rid,
      oname: name,
      path: middlePath + saveName,
      tpath: middlePath + saveName,
      ext: extension,
      size,
      uid: ctx.data.user.uid,
      toc: Date.now(),
      mediaType: mediaType
    });
    ctx.data.r = await r.save();
    await next()
  })
module.exports = resourceRouter;