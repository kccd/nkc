const tools = require('../tools');
module.exports = async (ctx, next) => {
  const {time, path} = ctx.query;
  ctx.filePath = await tools.getTargetFilePath(Number(time), path);
  await next();
}