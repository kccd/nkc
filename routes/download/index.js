const Router = require('koa-router');
const downloadRouter = new Router();
const fss = require("fs");

downloadRouter
.post('/', async (ctx, next) => {
    const {fs} = ctx;
    const settings = ctx.settings;
    const {imageMagick} = ctx.tools;
    const timeStr = new Date().getTime();
    const url = ctx.body.loadsrc;
/*    console.log("----*获取目标url*----");
    console.log("----*目标url*----")
    console.log(url)*/

    // const write = (data) =>{
    //     return new Promise((resolve, reject) => {

    //     })
    // }
    const downloadImg = (url, path) => {
        return new Promise((resolve, reject) => {
            let http;
            if(new RegExp("https").test(url)){
                http = require("https");
            }else{
                http = require("http");
            }
            http.get(url, (res) => {
                const {statusCode} = res;
                let ext = '';
                let data = '';
                let error = '';
                if(res.headers['content-type'] === "image" || res.headers['content-type'] === "image/jpg" || res.headers['content-type'] === "image/jpeg"){
                    ext = "jpg";
                }else if(res.headers['content-type'] === "image/png"){
                    ext = "png";
                }else if(res.headers['content-type'] === "image/gif"){
                    ext = "gif";
                }else if(res.headers['content-type'] === "application/x-bmp"){
                    ext = "bmp";
                }else if(res.headers['content-type'] === "image/svg+xml"){
                    ext = "svg";
                }else{
                    error = new Error('不是图片');
                    reject(error)
                }
                let result = {
                    exts: ext,
                    sizes: res.headers['content-length']
                };
                if (statusCode !== 200) {
                    error = new Error('请求失败。\n' + `状态码: ${statusCode}`);
                    error.status = statusCode;
                    reject(error)
                } 
                res.setEncoding('binary');
                // res.on('error', (err) => {
                //     reject(err);
                // });
                res.on('data', (d) => {
                    data += d;
                });
                res.on('end', () => {
                    fss.writeFile(path+'.'+ext, data, 'binary', (err) => {
                        if(err) return reject(err);
                        resolve(result);
                    });
                });

            }).on('err', (err) => {
                reject(err);
            })
        })
            
    };
    
    let funcResult = await downloadImg(url, './tmp/upload_'+timeStr);
    
    //获得图片格式和尺寸
    const extension = funcResult.exts;
    const size = funcResult.sizes;
    const name = timeStr + '.' + extension;
    const path = './tmp/' + 'upload_' +  timeStr + '.' + extension;
    // 图片最大尺寸
    const {largeImage} = settings.upload.sizeLimit;
    // 根据自增id定义图片名称
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    // 图片名称279471.png
    const saveName = rid + '.' + extension;
    const {uploadPath, generateFolderName, thumbnailPath} = settings.upload;
    // 图片储存路径 /2018/04/
    const relPath = generateFolderName(uploadPath);
    // 路径 d:\nkc\resources\upload/2018/04/
    const descPath = uploadPath + relPath;
    // 路径+图片名称 d:\nkc\resources\upload/2018/04/279472.png
    const descFile = descPath + saveName;
    // 如果格式满足则生成缩略图
    const descPathOfThumbnail = generateFolderName(thumbnailPath); // 存放路径
    const thumbnailFilePath = thumbnailPath + descPathOfThumbnail + saveName; // 路径+名称
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
      username = column?column.displayName : ctx.data.user.uid+"的专栏";
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
      userCoor = "+10+10";
    }else if(waterGravity === "southwest"){
      // 左下角，Logo不偏移，文字横向正偏移
      logoCoor = "+10+10";
      userCoor = "+"+parseInt(siteLogoWidth+10)+"+10"
    }else if(waterGravity === "northeast"){
      // 右上角，Logo横向负偏移，文字纵向正偏移
      logoCoor = "+"+parseInt(usernameWidth+10)+"+10"
      userCoor = "+10+"+parseInt(siteLogoHeigth-24+10);
    }else if(waterGravity === "northwest"){
      // 左上角，Logo不偏移，文字横向正偏移+纵向正偏移
      logoCoor = "+10+10";
      userCoor = "+"+parseInt(siteLogoWidth+10)+"+"+parseInt(siteLogoHeigth-24+10)
    }else{
      logoCoor = "+0+0";
      userCoor = "+0+0"
    }
    // 获取图片尺寸
    const { width, height } = await imageMagick.info(path);
    // 如果图片宽度大于1024，则将图片宽度缩为1024
    if(width > 1024){
      await imageMagick.imageNarrow(path)
    }
    // 如果图片尺寸大于600, 并且用户水印设置为true，则为图片添加水印
    if(width > 600 && height > 200 && waterAdd === true){
      if(waterStyle === "siteLogo"){
        await imageMagick.watermarkify(transparency, waterGravity, path)
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
    // // 添加水印
    // if(size > largeImage) {
    //     await imageMagick.attachify(path);
    // } 
    // // else {
    // //     const {width, height} = await imageMagick.info(path);
    // //     if(height > 400 || width > 300) {
    // //         await imageMagick.watermarkify(path);
    // //     }
    // // }
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


module.exports = downloadRouter;
