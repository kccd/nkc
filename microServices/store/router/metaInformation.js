const {getFileMetaInfo, getTargetFilePath} = require('../tools')
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const files = JSON.parse(query.files);
  data.metaInfos = {};
  for(const file in files) {
    const arr = [];
    for(const f in files[file]) {
      const {path, type, time} = files[file][f];
      const filePath = await getTargetFilePath(Number(time), path);
      const metaInfo = await getFileMetaInfo(filePath);
      arr.push({
        type,
        metaInfo: metaInfo || {},
      });
    }
    data.metaInfos[file] = arr;
  }
  await next();
}