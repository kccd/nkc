const apiFn = require('../nkcModules').apiFunction;
const {encodeRFC5987ValueChars} = apiFn;
const path = require('path');
module.exports = async (ctx, next) => {
  const {filePath, resource, fs, type} = ctx;
  // if(type !== 'application/json' && type !== 'text/html' && ctx.method === 'GET') {  //只有当请求方式为GET时才返回图片
  if(filePath && ctx.method === 'GET') {
	  if(ctx.lastModified && ctx.fresh) {
      ctx.status = 304;
      return
    }
    const basename = path.basename(ctx.filePath);
    let ext = path.extname(ctx.filePath);
    ext = ext.replace('.', '');
    const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif'];
    const name = resource? resource.oname: basename;
    if(extArr.includes(ext)) {
      ctx.set('Content-Disposition', `inline; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`);
    } else {
      ctx.set('Content-Disposition', `attachment; filename=${encodeRFC5987ValueChars(name)}; filename*=utf-8''${encodeRFC5987ValueChars(name)}`)
    }
    ctx.body = fs.createReadStream(filePath);
    ctx.set('content-length', (await fs.stat(filePath)).size);
    await next();
  } else {
    ctx.logIt = true; // if the request is request to a content, log it;
    const type = ctx.request.accepts('json', 'html');
    const from = ctx.request.get('FROM');
    if(from === 'htmlAPI'){
	    ctx.data.html = ctx.nkcModules.render(path.resolve('./pages/' + ctx.localTemplate), ctx.data);
	    ctx.body = ctx.data;
    } else if(type === 'json' && from === 'nkcAPI') {
	    ctx.type = 'json';
	    if(ctx.data.user) ctx.data.user = ctx.data.user.toObject();
	    ctx.body = ctx.data;
    } else {
      ctx.type = 'html';
	    ctx.body = ctx.nkcModules.render(ctx.template, ctx.data);
    }
    await next();
  }
};