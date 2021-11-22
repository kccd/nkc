const {
  getTargetFilePath,
  getFileInfo,
  accessFile
} = require("../tools");
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const files = JSON.parse(query.files);
  data.files = [];
  for(const file of files) {
    const {type, time, path} = file;
    const filePath = await getTargetFilePath(Number(time), path);
    const lost = !await accessFile(filePath);
    let info = null;
    if(!lost) {
      info = await getFileInfo(filePath);
    }
    data.files.push({
      type,
      time,
      path,
      lost,
      info
    });
  }
  await next();
};