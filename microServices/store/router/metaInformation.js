const {getFileMetaInfo, getTargetFilePath} = require('../tools')
module.exports = async (ctx, next) => {
  const {data, body} = ctx;
  const {files} = body;
  for(const file of files) {
    const {path, time} = file;
    const filePath = await getTargetFilePath(Number(time), path);
    file.metaInfo = await getFileMetaInfo(filePath);
  }
  data.files = files;
  await next();

}
