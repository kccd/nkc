const Router = require('koa-router');
const downloadRouter = new Router();
const fss = require("fs");
const pathh = require('path');
const mediaMethods = require('../resource/methods');
downloadRouter
  .post('/', async (ctx, next) => {
    const {nkcModules, tools, db, data} = ctx;
    const {user} = data;
    const timeStr = new Date().getTime();
    const url = ctx.body.loadsrc;
    ctx.data.source = url;
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
          }else if(res.headers['content-type'] === "image/webp"){
            ext = "webp";
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
            const filePath = path+'.'+ext;
            fss.writeFile(filePath, data, 'binary', (err) => {
              if(err) return reject(err);
              result.path = filePath;
              resolve(result);
            });
          });

        }).on('error', (err) => {
          reject(err);
        })
      })

    };
    let funcResult = await downloadImg(url, pathh.resolve(__dirname, `../../tmp/upload_${timeStr}`));

    if(funcResult.exts === "webp") {
      const _filePath = pathh.resolve(__dirname, `../../tmp/upload_${timeStr}.jpg`);
      await tools.imageMagick.imageExtTurn(funcResult.path, _filePath);
      funcResult.path = _filePath;
    }

    const file = await nkcModules.file.getFileObjectByFilePath(funcResult.path);
    const {name, size, hash, ext, mediaType} = file

    await db.ResourceModel.checkUploadPermission(user, file);
    const extension = ext;
    const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);
    const resourceType = 'resource';

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

    await r.save();

    await mediaMethods[mediaType]({
      file,
      user,
      resource: r,
      pictureType: resourceType,
    });

    ctx.data.r = await db.ResourceModel.findOne({rid});
    ctx.data.state = "SUCCESS";
    await next()
  });


module.exports = downloadRouter;
