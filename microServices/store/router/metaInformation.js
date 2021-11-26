const PATH = require('path');
const {getFileMetaInfo, getTargetFilePath} = require('../tools')
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const files = JSON.parse(query.files);
  data.metaInfos = [];
  for(const file of files) {
    const {path, type, time} = file;
    const filePath = await getTargetFilePath(Number(time), path);
    const metaInfo = await getFileMetaInfo(filePath);
    data.metaInfos.push({
      type,
      metaInfo: metaInfo || {},
    });
  }
  await next();
}