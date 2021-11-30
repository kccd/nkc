const tools = require('../tools');
module.exports = async (ctx, next) => {
  const {files} = ctx.body;
  const filesInfo = JSON.parse(ctx.body.fields.filesInfo);
  for(const filename in files) {
    if(!files.hasOwnProperty(filename)) continue;
    const {time, path} = filesInfo[filename];
    const file = files[filename];
    const targetFilePath = await tools.getTargetFilePath(time, path);
    await tools.moveFile(file.path, targetFilePath);
  }
  await next();
}
