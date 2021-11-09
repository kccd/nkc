const path = require("path");
const tools = require("../tools");
const fs = require("fs");
const fsPromises = fs.promises;
module.exports = async (ctx, next) => {
  const {data, filePath} = ctx;
  if(filePath) {
    const stat = await fsPromises.stat(filePath);
    const {size, mtime} = stat;
    const lastModified = (new Date(mtime)).getTime();
    ctx.set('ETag', lastModified);
    ctx.set('Cache-Control', 'public, max-age=604800');
    if(ctx.fresh) {
      ctx.status = 304;
      return;
    }
    const basename = path.basename(filePath);
    let ext = path.extname(filePath);
    ext = ext.replace('.', '');
    ext = ext.toLowerCase();
    let contentLength = size;
    let readStreamRange = {};
    ctx.set("Accept-Ranges", "bytes");
    let headerRange = ctx.request.headers['range'];
    if(headerRange) {
      const range = tools.parseRange(headerRange, size);
      if(range) {
        contentLength = range.end - range.start + 1;
        readStreamRange = {
          start: range.start,
          end: range.end
        };
        ctx.set(`Content-Range`, `bytes ${range.start}-${range.end}/${stats.size}`);
        ctx.status = 206;
      }
    }
    ctx.body = fs.createReadStream(filePath, readStreamRange);
    ctx.set(`Content-Disposition`, `attachment; filename=${basename}`);
    ctx.set(`Content-Length`, contentLength);
    ctx.type = ext;
  } else {
    ctx.body = data;
    ctx.type = 'json';
  }
  await next();
}