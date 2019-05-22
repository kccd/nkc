const Router = require('koa-router');
const imageEditRouter = new Router();
const pathModule = require('path');
const util = require("util");
const pictureExts = ["jpg", "jpeg", "png", "bmp", "svg", "gif"];
const videoExts = ["mp4", "mov", "3gp", "avi"];
const audioExts = ["wav", "amr"];
const {upload, statics, cache} = require('../../settings');
const {mediumPath, thumbnailPath} = upload;
// const {defaultThumbnailPath} = statics;
imageEditRouter
  .patch('/getOriginId', async( ctx, next)=> {
    // 获取图片的原图id
    const {body, data, db} = ctx;
    const {rid} = body;
    const resource = await db.ResourceModel.findOne({rid: rid});
    if(resource.originId) {
      data.originId = resource.originId
    }else{
      data.originId = "";
    }
    await next();
  })
  .post('/', async (ctx, next) => {
    const { fs } = ctx;
    const { imageMagick, ffmpeg } = ctx.tools;
    const settings = ctx.settings;
    const { largeImage, upload } = settings.upload.sizeLimit;
    const { mediaPath, uploadPath, generateFolderName, thumbnailPath, mediumPath, originPath, frameImgPath} = settings.upload;
    const {selectDiskCharacterUp} = settings.mediaPath;
    
    let mediaRealPath;
    const file = ctx.body.files.file;
    let originId = "";
    if(ctx.body.fields && ctx.body.fields.originId) {
      originId = ctx.body.fields.originId;
    }
    if(!file) {
      ctx.throw(400, 'no file uploaded');
    }
    let {size, path} = file;
    let name = new Date().getTime() + ".jpg";
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
    }
    // 带有年份月份的文件储存路径 /2018/04/
    // const middlePath = generateFolderName(uploadPath);
    let middlePath = generateFolderName(mediaRealPath);
    // 路径 d:\nkc\resources\video/2018/04/256647.mp4
    let mediaFilePath = mediaRealPath + middlePath + saveName;

    // 图片裁剪水印
    if (['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'].indexOf(extension.toLowerCase()) > -1) {
      // 如果格式满足则生成缩略图
      const descPathOfThumbnail = generateFolderName(thumbnailPath); // 略缩图存放路径
      const descPathOfMedium = generateFolderName(mediumPath); // 中号图存放路径
      const thumbnailFilePath = thumbnailPath + descPathOfThumbnail + saveName; // 略缩图路径+名称
      const mediumFilePath = mediumPath + descPathOfThumbnail + saveName; // 中号图路径 + 名称


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
      // 获取图片尺寸
      const { width, height } = await imageMagick.info(path);
      // 生成略缩图
      if(width > 150 || size > 51200) {
        await imageMagick.thumbnailify(path, thumbnailFilePath);
      }else{
        await fs.copyFile(path, thumbnailFilePath);
      }
      // 生成中号图
      if(width > 640 || size > 102400) {
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
      let waterSmall = await ctx.db.SettingModel.findOne({_id:"home"});
      waterSmall = waterSmall.c;
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
      // 如果图片宽度大于1920，则将图片宽度缩为1920
      if(size > 500000) {
        await imageMagick.imageNarrow(path);
      }else if(width > 1920) {
        await imageMagick.imageNarrow(path);
      }
      // if(width > 1920 && size > largeImage){
      //   await imageMagick.imageNarrow(path)
      // }
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
      originId,
      uid: ctx.data.user.uid,
      toc: Date.now(),
      mediaType: mediaType
    });
    ctx.data.r = await r.save();
    await next()
  });
module.exports = imageEditRouter;