const path = require('path');
const fs = require('fs');
const apiFn = require('../nkcModules').apiFunction;
const {encodeRFC5987ValueChars} = apiFn;
module.exports = async (ctx, next) => {
  const {filePath, resource} = ctx;
  if(filePath) {
    const basename = path.basename(ctx.filePath);
    let mtime;
    try{
      mtime = fs.statSync(filePath).mtime;
    } catch (e) {
      mtime = new Date();
    }
    let ext = path.extname(ctx.filePath);
    ext = ext.replace('.', '');
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg'];
    const name = resource? resource.oname: basename;
    if(extArr.includes(ext)) {
      ctx.set('Content-Disposition', `inline; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`);
    } else {
      ctx.set('Content-Disposition', `attachment; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`)
    }
    ctx.response.lastModified = mtime.toUTCString();
    ctx.set('Cache-Control', 'max-age=0');
    if (ctx.fresh) {
      ctx.status = 304;
      return;
    }
    ctx.body = fs.createReadStream(ctx.filePath);
    await next();
  } else {
    const type = ctx.request.accepts('json', 'html');
    switch(type) {
      case 'json':
        ctx.type = 'json';
        ctx.body = ctx.data;
        break;
      case 'html':
        ctx.type = 'html';
        let t = Date.now();
        ctx.body = ctx.nkcModules.render(ctx.template, ctx.data);
        console.log(`=======================渲染页面耗时：${Date.now() - t}ms=======================`);
        break;
      default:
        ctx.throw(406, 'type not accectable')
    }
    await next();
  }
};