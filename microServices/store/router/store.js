const tools = require('../tools');
module.exports = async (ctx, next) => {
  const {files} = ctx.body;
  const filesInfo = JSON.parse(ctx.body.fields.filesInfo);
  console.log(filesInfo);
  for(const filename in files) {
    if(!files.hasOwnProperty(filename)) continue;
    const {time, destination} = filesInfo[filename];
    const file = files[filename];
    const targetFilePath = await tools.getTargetFilePath(time, destination);
    await tools.moveFile(file.path, targetFilePath);
  }
  await next();
}
