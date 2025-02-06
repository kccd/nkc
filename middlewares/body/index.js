const fileRes = require('./file');
const remoteState = require('./remoteState');
const remoteFileRes = require('./remoteFile');
const fileBufferRes = require('./fileBuffer');
const htmlRes = require('./html');
const jsonRes = require('./json');
const speedLimit = require('./speedLimit');

module.exports = async (ctx, next) => {
  const { filePath, remoteFile, fileBuffer, method } = ctx;
  if (method === 'GET' && (filePath || remoteFile || fileBuffer)) {
    if (filePath) {
      await fileRes(ctx);
    } else if (remoteFile) {
      await remoteFileRes(ctx);
    } else {
      await fileBufferRes(ctx);
    }
    await speedLimit(ctx);
    ctx.set('content-length', ctx.fileContentLength);
  } else {
    if (ctx.acceptJSON) {
      await jsonRes(ctx);
    } else {
      await remoteState(ctx);
      await htmlRes(ctx);
    }
  }
  await next();
};
