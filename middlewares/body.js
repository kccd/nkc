const path = require('path');
const fss = require('fs');
const utils = require('./utils');
module.exports = async (ctx, next) => {
  const {filePath, fileType, fileName, resource, fs, tg} = ctx;
  const {encodeRFC5987ValueChars} = ctx.nkcModules.nkcRender;
  if(filePath && ctx.method === 'GET') {
    let stats;
    try{
      stats = fss.statSync(filePath);
    } catch(err) {
      ctx.throw(404, err);
    }
    const lastModified = (new Date(stats.mtime)).getTime();
    ctx.set("ETag", lastModified);
    ctx.set('Cache-Control', 'public, max-age=604800');
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

    if(fileType !== "attachment" && extArr.includes(ext)) { // 图片
      ctx.set('Content-Disposition', `inline; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`);
      ctx.body = fs.createReadStream(filePath);
      ctx.set('Content-Length', stats.size);
    } else if(fileType !== "attachment" && rangeExt.includes(ext)) { // 音频、视频、pdf
      ctx.set('Content-Disposition', `inline; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`);
      ctx.set("Accept-Ranges", "bytes");
      let createdStream = false;
      if(ctx.request.headers['range']){
        const range = utils.parseRange(ctx.request.headers["range"], stats.size);
        if(range){
          ctx.body = await fss.createReadStream(filePath, {
            start: range.start,
            end: range.end
          });
          ctx.set("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
          ctx.set("Content-Length", (range.end - range.start + 1));
          createdStream = true;
          ctx.status = 206;
        }
      }
      if(!createdStream) {
        ctx.body = await fss.createReadStream(filePath);
        ctx.set("Content-Length", stats.size);
      }
    } else { // 附件
      ctx.set('Content-Disposition', `attachment; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`)
      if(tg) {
        ctx.body = fss.createReadStream(filePath).pipe(tg.throttle());
      } else {
        ctx.body = fss.createReadStream(filePath);
      }
      ctx.set('Content-Length', stats.size);
    }
    await next();
  } else {
    ctx.logIt = true; // if the request is request to a content, log it;
    const type = ctx.request.accepts('json', 'html');
    const from = ctx.request.get('FROM');
    if(type === 'json' && from === 'nkcAPI') {
	    ctx.type = 'json';
	    if(ctx.data.user) ctx.data.user = ctx.data.user.toObject();
	    ctx.body = ctx.data;
    } else {
      ctx.type = 'html';
	    ctx.body = ctx.nkcModules.render(ctx.template, ctx.data, ctx.state);
    }
    await next();
  }
};
