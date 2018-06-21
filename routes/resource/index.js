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
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif'];
    if (!extArr.includes(resource.ext.toLowerCase()) && !data.user) ctx.throw(403, '只有登录用户可以下载附件，请先登录或者注册。');
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
    ctx.filePath = filePath;
    ctx.resource = resource;
    ctx.type = ext;
    await next()
  })
  .post('/', async (ctx, next) => {
    const { fs } = ctx;
    const { imageMagick } = ctx.tools;
    const settings = ctx.settings;
    const file = ctx.body.files.file;
    if (!file)
      ctx.throw(400, 'no file uploaded');
    const { name, size, path } = file;
    //path "d:\nkc\tmp\upload_0e50089913dcacbc9514f64c3e3d31f4.png"
    // 图片格式 png/jpg
    const extensionE = pathModule.extname(name).replace('.', '');
    const extension = extensionE.toLowerCase()
    // 图片最大尺寸
    const { largeImage } = settings.upload.sizeLimit;
    // 根据自增id定义图片名称
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    // 图片名称279471.png
    const saveName = rid + '.' + extension;
    const { uploadPath, generateFolderName, thumbnailPath } = settings.upload;
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
      // 获取文字水印的字符数、宽度、高度
      const username = ctx.data.user?ctx.data.user.username : "科创论坛";
      // const username = "特斯拉520 Casd@#$ 123ASDewfsdf,./ fds士大夫";
      // console.log(username.replace(/[^\x00-\xff]/g,"01").length)
      const usernameLength = username.replace(/[^\x00-\xff]/g,"01").length;
      const usernameWidth = usernameLength * 12;
      const usernameHeight = 24;
      // 根据水印位置计算偏移量
      let userCoor; // 文字水印偏移量
      let userXcoor = 0; // 文字水印横向偏移量
      let userYcoor = 0; // 文字水印纵向偏移量
      let logoCoor; // Logo水印偏移量
      let logoXcoor = 0; // Logo水印横向偏移量
      let logoYcoor = 0; // Logo水印纵向偏移量
      if(waterGravity === "center"){
        // 正中间，Logo横向负偏移，文字不偏移
        // logoXcoor -= parseInt(usernameWidth/2 + 23)
        logoCoor = "-"+parseInt(usernameWidth/2+23)+"+0";
        userCoor = "+0+0";
      }else if(waterGravity === "southeast"){
        // 右下角，Logo横向负偏移，文字不偏移
        logoCoor = "+"+parseInt(usernameWidth)+"+0"
        userCoor = "+0+0";
      }else if(waterGravity === "southwest"){
        // 左下角，Logo不偏移，文字横向正偏移
        logoCoor = "+0+0";
        userCoor = "+27+0"
      }else if(waterGravity === "northeast"){
        // 右上角，Logo横向负偏移，文字纵向正偏移
        logoCoor = "+"+parseInt(usernameWidth)+"+0"
        userCoor = "+0+27";
      }else if(waterGravity === "northwest"){
        // 左上角，Logo不偏移，文字横向正偏移+纵向正偏移
        logoCoor = "+0+0";
        userCoor = "+27+27"
      }else{
        logoCoor = "+0+0";
        userCoor = "+0+0"
      }
      console.log(logoCoor,userCoor)
      // 获取图片尺寸
      const { width, height } = await imageMagick.info(path);
      // 如果图片宽度大于1024，则将图片宽度缩为1024
      if(width > 1024){
        await imageMagick.imageNarrow(path)
      }
      // 如果图片尺寸大于200, 并且用户水印设置为true，则为图片添加水印
      if(width > 200 && waterAdd === true){
        if(waterStyle === "siteLogo"){
          await imageMagick.watermarkify(logoCoor, waterGravity, path)
        }else{
          await imageMagick.watermarkify(logoCoor, waterGravity, path)
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