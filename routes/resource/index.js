const Router = require('koa-router');
const resourceRouter = new Router();
const pathModule = require('path');
resourceRouter
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a resource ID is required.');
    await next()
  })
  .get('/:rid', async (ctx, next) => {
    const { rid } = ctx.params;
    const { data, db, fs, settings } = ctx;
    const { cache } = settings;
    const resource = await db.ResourceModel.findOnly({ rid });
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif', 'mp4', '3gp', 'swf'];
    if (!extArr.includes(resource.ext.toLowerCase()) && !data.user) ctx.throw(403, '只有登录用户可以下载附件，请先登录或者注册。');
    // if (extArr.includes(resource.ext.toLowerCase()) && resource.references.length == 0 && (!data.user || data.user && data.user.uid !== resource.uid)) ctx.throw(403, '图片未发表在文章中，不可查看');
    const { path, ext } = resource;
    let filePath = pathModule.join(ctx.settings.upload.uploadPath, path);
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
    const file = ctx.body.files.file;
    if (!file)
      ctx.throw(400, 'no file uploaded');
    let { name, size, path } = file;
    //path "d:\nkc\tmp\upload_0e50089913dcacbc9514f64c3e3d31f4.png"
    // 图片格式 png/jpg
    const extensionE = pathModule.extname(name).replace('.', '');
    let extension = extensionE.toLowerCase();
    if(['mov'].indexOf(extension.toLowerCase()) > -1){
      let extReg = RegExp(extension, "igm");
      extension = "mp4";
      name = name.replace(extReg, "mp4");
    }
    // 图片最大尺寸
    const { largeImage } = settings.upload.sizeLimit;
    // 根据自增id定义图片名称
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    // 图片名称279471.png
    const saveName = rid + '.' + extension;
    const { uploadPath, generateFolderName, thumbnailPath, frameImgPath} = settings.upload;
    // 图片储存路径 /2018/04/
    const relPath = generateFolderName(uploadPath);
    // 路径 d:\nkc\resources\upload/2018/04/
    const descPath = uploadPath + relPath;
    // 路径+图片名称 d:\nkc\resources\upload/2018/04/279472.png
    const descFile = descPath + saveName;
    if (['jpg', 'jpeg', 'bmp', 'svg', 'png'].indexOf(extension.toLowerCase()) > -1) {
      // 如果格式满足则生成缩略图
      const descPathOfThumbnail = generateFolderName(thumbnailPath); // 存放路径
      const thumbnailFilePath = thumbnailPath + descPathOfThumbnail + saveName; // 路径+名称

      // 图片自动旋转
      await imageMagick.allInfo(path);

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
    // 上传视频，生成略缩图
    if (['mp4'].indexOf(extension.toLowerCase()) > -1) {
      //
      var timeStr = new Date().getTime();
      // 输出视频路径
      var newpath = pathModule.resolve();
      var outputVideoPath = newpath + "/tmp/" + timeStr + ".mp4";
      // 视频封面图路径
      var videoImgPath = frameImgPath + "/" + rid + ".jpg";
      await ffmpeg.videoTranscode(path, outputVideoPath);
      await fs.rename(outputVideoPath, path);
      await ffmpeg.videoFirstThumbTaker(path, videoImgPath);
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