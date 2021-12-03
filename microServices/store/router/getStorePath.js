const {getTargetFilePath} = require('../tools')
module.exports = async (ctx, next) => {
  const {data, body} = ctx;
  const {files} = body;
  for(const file of files) {
    const {path, time} = file;
    file.storePath = await getTargetFilePath(Number(time), path);
  }
  data.files = files;
  await next();

}
