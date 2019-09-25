const apiFn = require('../nkcModules').apiFunction;
const {encodeRFC5987ValueChars} = apiFn;
const path = require('path');
const fss = require('fs');
const utils = require('./utils');
module.exports = async (ctx, next) => {
  const {filePath, fileName, resource, fs} = ctx;
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
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif'];
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
    if(ext === "mp4"){
      if(ctx.request.headers['range']){
        var range = utils.parseRange(ctx.request.headers["range"], stats.size);
        if(range){
          ctx.set("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
          ctx.set("Content-Length", (range.end - range.start + 1));
          var stream = await fss.createReadStream(filePath, {
            "start": range.start,
            "end": range.end
          });
          // ctx.response.writeHead('206', "Partial Content");
          ctx.status = 206;
          ctx.body = stream;
          // stream.pipe(ctx.response);
        }else{
          if(ctx.response) {
            // ctx.response.removeHeader("Content-Length");
            ctx.status = 416;
            // ctx.response.end();
          }
        }
      }else{

        // ctx.response.writeHead('200', "Partial Content");
        ctx.status = 200;
        ctx.body = fss.createReadStream(filePath);
        // stream.pipe(ctx.response);
      }
    }else{
      if(extArr.includes(ext)) {
        ctx.set('Content-Disposition', `inline; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`);
      } else {
        ctx.set('Content-Disposition', `attachment; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`)
      }
      ctx.body = fs.createReadStream(filePath);
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