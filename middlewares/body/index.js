const fileRes = require('./file');
const remoteState = require('./remoteState');
const remoteFileRes = require('./remoteFile');
const htmlRes = require('./html');
const jsonRes = require('./json');
const speedLimit = require('./speedLimit');

module.exports = async (ctx, next) => {
  const { filePath, remoteFile, method } = ctx;
  if (method === 'GET' && (filePath || remoteFile)) {
    if (filePath) {
      await fileRes(ctx);
    } else {
      await remoteFileRes(ctx);
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
