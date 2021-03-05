const path = require('path');
const fss = require('fs');
const fsPromise = fss.promises;
const utils = require('./utils');
const {ThrottleGroup} = require("stream-throttle");
const onFinished = require('on-finished');
const destroy = require('destroy');

let allSpeedLimit;

module.exports = async (ctx, next) => {
  const {filePath, fileType, fileName, resource, fs, tg, db} = ctx;
  const {encodeRFC5987ValueChars} = ctx.nkcModules.nkcRender;
  if(filePath && ctx.method === 'GET') {
    let stats;
    try{
      stats = await fsPromise.stat(filePath);
    } catch(err) {
      ctx.throw(500, `file(${path.basename(filePath || '')}) not found`);
    }
    const lastModified = (new Date(stats.mtime)).getTime();
    ctx.set("ETag", lastModified);
    if(ctx.dontCacheFile) {
      ctx.set("Cache-Control", "no-store");
    } else {
      ctx.set('Cache-Control', 'public, max-age=604800');
    }
	  if(ctx.fresh) {
      ctx.status = 304;
      return
    }
    const basename = path.basename(ctx.filePath);
    let ext = path.extname(ctx.filePath);
    ext = ext.replace('.', '');
    ext = ext.toLowerCase();
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif'];
    const rangeExt = ["pdf", "mp3", "mp4"];
    let name;
    if(resource) {
      name = resource.oname;
    } else if(fileName) {
      name = fileName
    } else {
      name = basename;
    }
    // 设置文件类型
    ctx.type = ext;

    let createdStream, contentLength, contentDisposition;

    if(fileType === 'attachment' || (!extArr.includes(ext) && (!rangeExt.includes(ext)))) {
      contentDisposition = `attachment; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`;
    } else {
      contentDisposition = `inline; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`;
    }
    ctx.set("Accept-Ranges", "bytes");
    let headerRange = ctx.request.headers['range'];
    if(headerRange) {
      const range = utils.parseRange(headerRange, stats.size);
      if(range) {
        contentLength = range.end - range.start + 1;
        createdStream = fs.createReadStream(filePath, {
          start: range.start,
          end: range.end
        });
        ctx.set(`Content-Range`, `bytes ${range.start}-${range.end}/${stats.size}`);
        ctx.status = 206;
      }
    }

    if(!createdStream) {
      createdStream = fs.createReadStream(filePath);
      contentLength = stats.size;
    }

    // 全局限速
    const downloadSettings = await db.SettingModel.getSettings('download');
    const newAllSpeed = downloadSettings.allSpeed;

    if(!allSpeedLimit || allSpeedLimit.speed !== newAllSpeed) {
      allSpeedLimit = {
        tg: new ThrottleGroup({rate: newAllSpeed * 1024}),
        speed: newAllSpeed
      };
    }

    if(tg) {
      ctx.body = createdStream.pipe(tg.throttle()).pipe(allSpeedLimit.tg.throttle());
    } else {
      ctx.body = createdStream.pipe(allSpeedLimit.tg.throttle());
    }
    onFinished(ctx.res, (err) => {
      destroy(createdStream);
    });
    ctx.set('Content-Disposition', contentDisposition);
    ctx.set(`Content-Length`, contentLength);
    await next();
  } else {
    ctx.logIt = true; // if the request is request to a content, log it;
    const type = ctx.request.accepts('json', 'html');
    const from = ctx.request.get('FROM');
    if(type === 'json' && from === 'nkcAPI') {
	    ctx.type = 'json';
	    if(ctx.data.user) ctx.data.user = ctx.data.user.toObject();
	    delete ctx.data.userGrade;
	    delete ctx.data.userOperationsId;
	    delete ctx.data.userRoles;
	    ctx.body = ctx.data;
    } else {
      ctx.type = 'html';
      // ctx.body = await ctx.nkcModules.renderPug(ctx.template, ctx.data, ctx.state);
	    ctx.body = ctx.nkcModules.render(ctx.template, ctx.data, ctx.state);
    }
    await next();
  }
};
