const fileRes = require('./file');
const remoteFileRes = require('./remoteFile');
const htmlRes = require('./html');
const jsonRes = require('./json');
const speedLimit = require('./speedLimit');

module.exports = async (ctx, next) => {
  const {filePath, remoteFile, request, method} = ctx;
  if(method === 'GET' && (filePath || remoteFile)) {
    if(filePath) await fileRes(ctx);
    else await remoteFileRes(ctx);
    await speedLimit(ctx);
    ctx.set('content-length', ctx.fileContentLength);
  } else {
    if(
      request.accepts('json', 'html') === 'json' &&
      request.get('FROM') === 'nkcAPI'
    ) {
      await jsonRes(ctx);
    } else {
      await htmlRes(ctx);
    }
  }
  await next();
};
