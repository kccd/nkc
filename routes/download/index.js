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
    //开始裁剪、压缩
    await imageMagick.thumbnailify(path, thumbnailFilePath);
    // 添加水印
    if(size > largeImage) {
        await imageMagick.attachify(path);
    } 
    // else {
    //     const {width, height} = await imageMagick.info(path);
    //     if(height > 400 || width > 300) {
    //         await imageMagick.watermarkify(path);
    //     }
    // }
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
