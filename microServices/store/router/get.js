const tools = require('../tools');
module.exports = async (ctx, next) => {
  const {time, destination} = ctx.query;
  ctx.filePath = await tools.getTargetFilePath(time, destination);
  await next();
}