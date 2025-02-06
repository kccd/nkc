module.exports = (ctx) => {
  ctx.body = ctx.fileBuffer;
  ctx.fileContentLength = ctx.body.byteLength;
};
